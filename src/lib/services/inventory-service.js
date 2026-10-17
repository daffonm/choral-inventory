import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase-client";
import { seedInventoryData } from "./seeder-service";

/**
 * Modular Batch Importer:
 * Menerima array data inventaris dan menyimpannya ke Firestore secara batch.
 * Fungsi ini dirancang modular: bisa menerima data hasil parsing file XLSX / CSV atau input UI.
 * maupun menerima data hasil parsing file XLSX / CSV di masa depan.
 * 
 * @param {Array<Object>} records - Array of inventory records
 * @param {Object} options - { merge: boolean }
 * @returns {Promise<{ success: boolean, count: number, error?: string }>}
 */
export async function importInventoryRecords(records, options = { merge: true }) {
  if (!Array.isArray(records) || records.length === 0) {
    return { success: false, count: 0, error: "Tidak ada data untuk diimpor." };
  }

  try {
    const currentUserEmail = auth.currentUser?.email || "system";
    const inventoryCol = collection(db, "inventory");

    // Firestore memiliki batas 500 operasi per writeBatch
    const BATCH_SIZE = 400;
    let totalImported = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      chunk.forEach((item) => {
        // Gunakan SKU sebagai document ID untuk mencegah duplikasi (idempotent)
        const docId = String(item.sku || "").trim().toUpperCase();
        if (!docId) return;

        const docRef = doc(inventoryCol, docId);

        // Standarisasi tipe data angka
        const totalStock = parseInt(item.totalStock ?? 0, 10);
        const availableStock = parseInt(item.availableStock ?? totalStock, 10);
        const reservedStock = parseInt(item.reservedStock ?? 0, 10);
        const damagedStock = parseInt(item.damagedStock ?? 0, 10);
        const minimumStock = parseInt(item.minimumStock ?? 20, 10);

        // Hitung status kesehatan stok secara otomatis
        let statusKesehatan = "Aman";
        if (availableStock <= minimumStock / 2) {
          statusKesehatan = "Kritis / Menipis";
        } else if (availableStock <= minimumStock) {
          statusKesehatan = "Peringatan Menipis";
        }

        const payload = {
          sku: docId,
          barcode: item.barcode || generateBarcodeForSku(docId, totalImported),
          namaProduk: String(item.namaProduk || "Produk Tanpa Nama").trim(),
          totalStock: isNaN(totalStock) ? 0 : Math.max(0, totalStock),
          availableStock: isNaN(availableStock) ? 0 : Math.max(0, availableStock),
          reservedStock: isNaN(reservedStock) ? 0 : Math.max(0, reservedStock),
          damagedStock: isNaN(damagedStock) ? 0 : Math.max(0, damagedStock),
          minimumStock: isNaN(minimumStock) ? 20 : minimumStock,
          lokasiGudang: item.lokasiGudang || "Gudang Utama Pusat (Rack A1)",
          statusKesehatan: item.statusKesehatan || statusKesehatan,
          kategori: item.kategori || "Tactical Bags",
          updatedAt: serverTimestamp(),
          updatedBy: currentUserEmail,
        };

        batch.set(docRef, payload, { merge: options.merge });
        totalImported++;
      });

      await batch.commit();
    }

    return {
      success: true,
      count: totalImported,
    };
  } catch (error) {
    console.error("importInventoryRecords error:", error);
    return {
      success: false,
      count: 0,
      error: error.message || "Gagal mengimpor data ke Firestore.",
    };
  }
}

/**
 * Helper untuk men-generate format barcode EAN/Code128 konsisten dari SKU
 */
function generateBarcodeForSku(sku, index = 0) {
  // Format standar barcode CHORAL: prefix 899 + 9 digit
  const numericPart = sku.replace(/[^0-9]/g, "");
  const baseCode = (numericPart + String(index + 1001)).padEnd(9, "0").slice(0, 9);
  return `8997234${baseCode}`;
}

/**
 * Seeder untuk migrasi data awal dari dummyData.js ke Firestore
 */
export async function seedInventoryFromDummy() {
  return await seedInventoryData();
}

/**
 * Mutasi Stok Terpadu: Menyesuaikan stok dan mencatat riwayat ke stock_movements
 */
export async function recordStockMovement({
  sku,
  quantity,
  transactionType,
  reason = "",
  source = "Gudang Utama",
  referenceTransaction = "",
}) {
  const userEmail = auth.currentUser?.email || "system";
  const docId = String(sku).trim().toUpperCase();
  const itemRef = doc(db, "inventory", docId);
  const movementsCol = collection(db, "stock_movements");

  try {
    return await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Barang dengan SKU ${sku} tidak ditemukan.`);
      }

      const currentData = itemSnap.data();
      const newTotal = Math.max(0, (currentData.totalStock || 0) + quantity);
      const newAvailable = Math.max(0, (currentData.availableStock || 0) + quantity);
      const minStock = currentData.minimumStock || 20;

      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      // Update data stok
      transaction.update(itemRef, {
        totalStock: newTotal,
        availableStock: newAvailable,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // Catat audit trail movement
      const movementPayload = {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: parseInt(quantity, 10),
        transactionType: transactionType || (quantity >= 0 ? "Incoming" : "Outgoing"),
        source,
        reason,
        referenceTransaction: referenceTransaction || `TX-${Date.now()}`,
        user: userEmail,
        timestamp: serverTimestamp(),
      };

      const newMovementRef = doc(movementsCol);
      transaction.set(newMovementRef, movementPayload);

      return {
        success: true,
        newStock: newAvailable,
        statusKesehatan,
      };
    });
  } catch (error) {
    console.error("recordStockMovement error:", error);
    return {
      success: false,
      error: error.message || "Gagal mencatat pergerakan stok.",
    };
  }
}
