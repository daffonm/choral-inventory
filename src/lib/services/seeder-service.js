import { collection, doc, writeBatch, serverTimestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase-client";
import {
  masterData,
  barangMasukData,
  produksiData,
  persediaanData,
  pesananData,
  transaksiData,
  dashboardData,
} from "../dummyData";

/**
 * Seeder Service untuk CHORAL Inventory System
 * Digunakan untuk manual seed data dari dummyData.js ke Firestore.
 * Catatan: File ini adalah satu-satunya service operasional yang merujuk dummyData.js,
 * sehingga antarmuka UI utama tetap 100% murni membaca dari database live Firestore.
 */

// Helper batch writer
async function batchWriteCollection(collectionName, items, idKey = "id") {
  if (!items || items.length === 0) return 0;

  const colRef = collection(db, collectionName);
  const BATCH_SIZE = 400;
  let count = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((item, idx) => {
      const docId = String(item[idKey] || item.sku || item.movementId || `${collectionName}_${i + idx + 1}`).trim();
      const docRef = doc(colRef, docId);
      batch.set(
        docRef,
        {
          ...item,
          seededAt: serverTimestamp(),
          seededBy: auth.currentUser?.email || "manual-seeder",
        },
        { merge: true }
      );
      count++;
    });

    await batch.commit();
  }

  return count;
}

/**
 * 1. Seed Master Data (Products, Materials, Suppliers, Warehouses, Channels)
 */
export async function seedMasterData() {
  const counts = {};
  counts.products = await batchWriteCollection("master_products", masterData.produk, "sku");
  counts.materials = await batchWriteCollection("master_materials", masterData.material, "kodeMaterial");
  counts.suppliers = await batchWriteCollection("master_suppliers", masterData.supplier, "kodeSupplier");
  counts.warehouses = await batchWriteCollection("master_warehouses", masterData.gudang, "kodeGudang");
  counts.channels = await batchWriteCollection("master_channels", masterData.channel, "kodeChannel");
  return counts;
}

/**
 * 2. Seed Persediaan (Inventory, Movements, Opname)
 */
export async function seedInventoryData() {
  const counts = {};
  
  // Format inventory items
  const inventoryItems = (persediaanData.stokSaatIni || []).map((item) => ({
    ...item,
    totalStock: Number(item.totalStock || 0),
    availableStock: Number(item.availableStock || 0),
    reservedStock: Number(item.reservedStock || 0),
    damagedStock: Number(item.damagedStock || 0),
  }));
  counts.inventory = await batchWriteCollection("inventory", inventoryItems, "sku");

  // Stock movements
  counts.movements = await batchWriteCollection("stock_movements", persediaanData.pergerakanStok, "movementId");

  // Stock opname
  counts.opname = await batchWriteCollection("stock_opname", persediaanData.stockOpname, "opnameId");

  return counts;
}

/**
 * 3. Seed Barang Masuk (Inbound)
 */
export async function seedInboundData() {
  const allInbound = [
    ...(barangMasukData.penerimaanSupplier || []).map((i) => ({ ...i, type: "supplier" })),
    ...(barangMasukData.hasilProduksi || []).map((i) => ({ ...i, type: "produksi" })),
    ...(barangMasukData.barangRetur || []).map((i) => ({ ...i, type: "retur" })),
  ];
  const count = await batchWriteCollection("incoming_goods", allInbound, "noSuratJalan");
  return { incoming_goods: count };
}

/**
 * 4. Seed Produksi & Manufaktur
 */
export async function seedProductionData() {
  const count = await batchWriteCollection("production_orders", produksiData.daftarProduksi, "noSpk");
  return { production_orders: count };
}

/**
 * 5. Seed Pesanan & Fulfillment
 */
export async function seedOrdersData() {
  const allOrders = [
    ...(pesananData.daftarPesanan || []),
    ...(pesananData.riwayatPesanan || []),
  ];
  const count = await batchWriteCollection("orders", allOrders, "orderId");
  return { orders: count };
}

/**
 * 6. Seed Transaksi & Log Mutasi Pengeluaran
 */
export async function seedTransactionData() {
  const allTx = [
    ...(transaksiData.barangKeluar || []).map((i) => ({ ...i, category: "barang_keluar" })),
    ...(transaksiData.riwayatTransaksi || []).map((i) => ({ ...i, category: "riwayat_transaksi" })),
  ];
  const count = await batchWriteCollection("transactions", allTx, "id");
  return { transactions: count };
}

/**
 * 7. Seed Aktivitas Sistem (Dashboard Activities)
 */
export async function seedActivitiesData() {
  const count = await batchWriteCollection("activities", dashboardData.aktivitasTerbaru, "id");
  return { activities: count };
}

/**
 * Seed Semua Modul Sistem Sekaligus (One-Click Master Seeder)
 */
export async function seedAllSystemData() {
  const results = {};
  try {
    results.master = await seedMasterData();
    results.inventory = await seedInventoryData();
    results.inbound = await seedInboundData();
    results.production = await seedProductionData();
    results.orders = await seedOrdersData();
    results.transactions = await seedTransactionData();
    results.activities = await seedActivitiesData();
    return { success: true, results };
  } catch (error) {
    console.error("seedAllSystemData error:", error);
    return { success: false, error: error.message };
  }
}
