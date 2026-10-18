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

/**
 * Membuat master produk baru dan menyinkronkannya ke master_products, inventory, dan log activities
 * @param {Object} productData
 * @returns {Promise<{ success: boolean, sku?: string, error?: string }>}
 */
export async function createMasterProduct(productData) {
  if (!productData || !productData.sku || !productData.namaProduk) {
    return {
      success: false,
      error: "SKU dan Nama Produk wajib diisi.",
    };
  }

  const userEmail = auth.currentUser?.email || "Staf Gudang";
  const sku = String(productData.sku).trim().toUpperCase();
  const currentStock = parseInt(productData.currentStock || 0, 10);
  const minStock = parseInt(productData.minStock || 20, 10);
  const price = parseInt(productData.price || 0, 10);
  const hpp = parseInt(productData.hpp || 0, 10);

  // Status kesehatan inventaris
  let statusKesehatan = "Aman";
  if (currentStock <= minStock / 2) {
    statusKesehatan = "Kritis / Menipis";
  } else if (currentStock <= minStock) {
    statusKesehatan = "Peringatan Menipis";
  }

  const productPayload = {
    sku,
    namaProduk: String(productData.namaProduk).trim(),
    kategori: productData.kategori || "Tactical Bags",
    variant: productData.variant || "Standard",
    size: productData.size || "All Size",
    color: productData.color || "Black",
    barcode: productData.barcode || `899${Date.now().toString().slice(-10)}`,
    satuan: productData.satuan || "Pcs",
    jenisBarang: productData.jenisBarang || "Produk Jadi",
    price,
    hpp,
    currentStock,
    minStock,
    lokasiGudang: productData.lokasiGudang || "Gudang Utama (Rack A1)",
    deskripsi: productData.deskripsi || "",
    fotoUrl: productData.fotoUrl || "",
    status: productData.status || "Aktif",
    createdAt: serverTimestamp(),
    createdBy: userEmail,
    updatedAt: serverTimestamp(),
  };

  const inventoryPayload = {
    sku,
    barcode: productPayload.barcode,
    namaProduk: productPayload.namaProduk,
    totalStock: currentStock,
    availableStock: currentStock,
    reservedStock: 0,
    damagedStock: 0,
    minimumStock: minStock,
    lokasiGudang: productPayload.lokasiGudang,
    statusKesehatan,
    kategori: productPayload.kategori,
    fotoUrl: productPayload.fotoUrl,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  };

  const activityPayload = {
    id: `ACT-${Date.now()}`,
    type: "product",
    title: "Master Produk Baru Ditambahkan",
    description: `SKU ${sku} (${productPayload.namaProduk}) berhasil ditambahkan ke katalog master.`,
    timestamp: serverTimestamp(),
    user: userEmail,
    badgeVariant: "yellow",
  };

  try {
    const batch = writeBatch(db);

    // 1. Simpan ke master_products
    const masterDocRef = doc(collection(db, "master_products"), sku);
    batch.set(masterDocRef, productPayload, { merge: true });

    // 2. Sinkronkan ke koleksi inventory
    const inventoryDocRef = doc(collection(db, "inventory"), sku);
    batch.set(inventoryDocRef, inventoryPayload, { merge: true });

    // 3. Catat aktivitas audit
    const activityDocRef = doc(collection(db, "activities"));
    batch.set(activityDocRef, activityPayload);

    await batch.commit();

    return {
      success: true,
      sku,
    };
  } catch (error) {
    console.error("createMasterProduct error:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan master produk ke Firestore.",
    };
  }
}

