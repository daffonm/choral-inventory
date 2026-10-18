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
      const currentTotal = currentData.totalStock || 0;
      const currentAvailable = currentData.availableStock || 0;
      const qtyNumber = parseInt(quantity, 10);

      // ATOMIC CONCURRENCY GUARD: Cegah saldo minus / overdraft saat pengeluaran barang
      if (qtyNumber < 0 && currentAvailable < Math.abs(qtyNumber)) {
        throw new Error(
          `Stok tersedia tidak mencukupi! Tersisa ${currentAvailable} pcs, namun diminta keluar ${Math.abs(qtyNumber)} pcs.`
        );
      }

      const newTotal = Math.max(0, currentTotal + qtyNumber);
      const newAvailable = Math.max(0, currentAvailable + qtyNumber);
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
    return await runTransaction(db, async (transaction) => {
      // 1. Cek apakah SKU sudah pernah didaftarkan sebelumnya (cegah race condition dua admin menyimpan bersamaan)
      const masterDocRef = doc(collection(db, "master_products"), sku);
      const masterDoc = await transaction.get(masterDocRef);

      if (masterDoc.exists()) {
        throw new Error(`SKU ${sku} sudah terdaftar di sistem. Gunakan SKU lain.`);
      }

      // 2. Simpan ke master_products
      transaction.set(masterDocRef, productPayload);

      // 3. Sinkronkan ke koleksi inventory
      const inventoryDocRef = doc(collection(db, "inventory"), sku);
      transaction.set(inventoryDocRef, inventoryPayload, { merge: true });

      // 4. Catat aktivitas audit
      const activityDocRef = doc(collection(db, "activities"));
      transaction.set(activityDocRef, activityPayload);

      return {
        success: true,
        sku,
      };
    });
  } catch (error) {
    console.error("createMasterProduct error:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan master produk ke Firestore.",
    };
  }
}

/**
 * Membuat master material bahan baku baru di koleksi master_materials
 */
export async function createMasterMaterial(materialData) {
  if (!materialData || !materialData.kodeMaterial || !materialData.namaMaterial) {
    return {
      success: false,
      error: "Kode Material dan Nama Material wajib diisi.",
    };
  }

  const userEmail = auth.currentUser?.email || "Staf Gudang";
  const kode = String(materialData.kodeMaterial).trim().toUpperCase();
  const stokTersedia = parseInt(materialData.stokTersedia || 0, 10);
  const minimumStok = parseInt(materialData.minimumStok || 10, 10);
  const hargaPerSatuan = parseInt(materialData.hargaPerSatuan || 0, 10);

  const payload = {
    kodeMaterial: kode,
    namaMaterial: String(materialData.namaMaterial).trim(),
    jenisMaterial: materialData.jenisMaterial || "Bahan Utama (Kain)",
    satuan: materialData.satuan || "Meter",
    stokTersedia: isNaN(stokTersedia) ? 0 : stokTersedia,
    minimumStok: isNaN(minimumStok) ? 10 : minimumStok,
    hargaPerSatuan: isNaN(hargaPerSatuan) ? 0 : hargaPerSatuan,
    supplierUtama: materialData.supplierUtama || "-",
    lokasiRak: materialData.lokasiRak || "Rack Material M1",
    deskripsi: materialData.deskripsi || "",
    status: materialData.status || "Tersedia",
    createdAt: serverTimestamp(),
    createdBy: userEmail,
    updatedAt: serverTimestamp(),
  };

  const activityPayload = {
    id: `ACT-${Date.now()}`,
    type: "product",
    title: "Master Material Baru Ditambahkan",
    description: `Bahan ${kode} (${payload.namaMaterial}) didaftarkan ke katalog master material.`,
    timestamp: serverTimestamp(),
    user: userEmail,
    badgeVariant: "yellow",
  };

  try {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(collection(db, "master_materials"), kode);
      const snap = await transaction.get(docRef);

      if (snap.exists()) {
        throw new Error(`Kode Material ${kode} sudah terdaftar. Gunakan kode unik lain.`);
      }

      transaction.set(docRef, payload);

      const actRef = doc(collection(db, "activities"));
      transaction.set(actRef, activityPayload);

      return {
        success: true,
        kodeMaterial: kode,
      };
    });
  } catch (error) {
    console.error("createMasterMaterial error:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan master material ke Firestore.",
    };
  }
}

/**
 * Mendaftarkan mitra supplier / vendor baru di koleksi master_suppliers
 */
export async function createMasterSupplier(supplierData) {
  if (!supplierData || !supplierData.namaSupplier) {
    return {
      success: false,
      error: "Nama Supplier wajib diisi.",
    };
  }

  const userEmail = auth.currentUser?.email || "Staf Pembelian";
  const kode = (supplierData.kodeSupplier || `SUP-${Date.now().toString().slice(-4)}`).trim().toUpperCase();

  const payload = {
    kodeSupplier: kode,
    namaSupplier: String(supplierData.namaSupplier).trim(),
    kontakSupplier: supplierData.kontakSupplier || "-",
    pic: supplierData.pic || "-",
    jenisBarangSupplier: supplierData.jenisBarangSupplier || "Kain & Bahan Baku",
    kota: supplierData.kota || "Bandung, Jawa Barat",
    leadTime: supplierData.leadTime || "3-5 Hari",
    termOfPayment: supplierData.termOfPayment || "Net 30 Hari",
    email: supplierData.email || "",
    telepon: supplierData.telepon || "",
    alamat: supplierData.alamat || "",
    status: supplierData.status || "Aktif",
    createdAt: serverTimestamp(),
    createdBy: userEmail,
    updatedAt: serverTimestamp(),
  };

  const activityPayload = {
    id: `ACT-${Date.now()}`,
    type: "incoming",
    title: "Mitra Supplier Baru Terdaftar",
    description: `Vendor ${payload.namaSupplier} (${kode}) resmi ditambahkan ke daftar supplier.`,
    timestamp: serverTimestamp(),
    user: userEmail,
    badgeVariant: "neutral",
  };

  try {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(collection(db, "master_suppliers"), kode);
      const snap = await transaction.get(docRef);

      if (snap.exists()) {
        throw new Error(`Kode Supplier ${kode} sudah digunakan. Gunakan kode lain.`);
      }

      transaction.set(docRef, payload);

      const actRef = doc(collection(db, "activities"));
      transaction.set(actRef, activityPayload);

      return {
        success: true,
        kodeSupplier: kode,
      };
    });
  } catch (error) {
    console.error("createMasterSupplier error:", error);
    return {
      success: false,
      error: error.message || "Gagal mendaftarkan supplier ke Firestore.",
    };
  }
}

/**
 * Mendaftarkan fasilitas gudang / rack baru di koleksi master_warehouses
 */
export async function createMasterWarehouse(warehouseData) {
  if (!warehouseData || !warehouseData.namaGudang) {
    return {
      success: false,
      error: "Nama Fasilitas Gudang wajib diisi.",
    };
  }

  const userEmail = auth.currentUser?.email || "Kepala Gudang";
  const kode = (warehouseData.kodeGudang || `GDG-${Date.now().toString().slice(-4)}`).trim().toUpperCase();

  const payload = {
    kodeGudang: kode,
    namaGudang: String(warehouseData.namaGudang).trim(),
    lokasiPenyimpanan: warehouseData.lokasiPenyimpanan || "Bandung",
    rackArea: warehouseData.rackArea || "Area A (Finished Goods)",
    kapasitasMax: warehouseData.kapasitasMax || "10,000 Pcs",
    penanggungJawab: warehouseData.penanggungJawab || "Staf Gudang",
    tipeGudang: warehouseData.tipeGudang || "Gudang Produk Jadi",
    status: warehouseData.status || "Operational",
    telepon: warehouseData.telepon || "",
    catatan: warehouseData.catatan || "",
    createdAt: serverTimestamp(),
    createdBy: userEmail,
    updatedAt: serverTimestamp(),
  };

  const activityPayload = {
    id: `ACT-${Date.now()}`,
    type: "transaction",
    title: "Fasilitas Gudang Baru Ditambahkan",
    description: `${payload.namaGudang} (${kode}) didaftarkan ke sistem inventaris.`,
    timestamp: serverTimestamp(),
    user: userEmail,
    badgeVariant: "yellow",
  };

  try {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(collection(db, "master_warehouses"), kode);
      const snap = await transaction.get(docRef);

      if (snap.exists()) {
        throw new Error(`Kode Gudang ${kode} sudah digunakan. Gunakan kode unik lain.`);
      }

      transaction.set(docRef, payload);

      const actRef = doc(collection(db, "activities"));
      transaction.set(actRef, activityPayload);

      return {
        success: true,
        kodeGudang: kode,
      };
    });
  } catch (error) {
    console.error("createMasterWarehouse error:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan data gudang ke Firestore.",
    };
  }
}

/**
 * Mendaftarkan saluran distribusi / penjualan baru di koleksi master_channels
 */
export async function createMasterChannel(channelData) {
  if (!channelData || !channelData.namaChannel) {
    return {
      success: false,
      error: "Nama Channel Penjualan wajib diisi.",
    };
  }

  const userEmail = auth.currentUser?.email || "Sales Admin";
  const kode = (channelData.channelId || channelData.kodeChannel || `CHN-${Date.now().toString().slice(-4)}`).trim().toUpperCase();
  const stokDialokasikan = parseInt(channelData.stokDialokasikan || 0, 10);

  const payload = {
    channelId: kode,
    kodeChannel: kode,
    namaChannel: String(channelData.namaChannel).trim(),
    tipe: channelData.tipe || "Marketplace Online",
    komisi: channelData.komisi || "5.0%",
    status: channelData.status || "Aktif",
    stokDialokasikan: isNaN(stokDialokasikan) ? 0 : stokDialokasikan,
    pic: channelData.pic || "Tim Sales E-Commerce",
    keterangan: channelData.keterangan || "",
    createdAt: serverTimestamp(),
    createdBy: userEmail,
    updatedAt: serverTimestamp(),
  };

  const activityPayload = {
    id: `ACT-${Date.now()}`,
    type: "transaction",
    title: "Channel Distribusi Baru Terdaftar",
    description: `Channel ${payload.namaChannel} (${kode}) resmi diaktifkan untuk alokasi penjualan.`,
    timestamp: serverTimestamp(),
    user: userEmail,
    badgeVariant: "yellow",
  };

  try {
    return await runTransaction(db, async (transaction) => {
      const docRef = doc(collection(db, "master_channels"), kode);
      const snap = await transaction.get(docRef);

      if (snap.exists()) {
        throw new Error(`Channel ID ${kode} sudah terdaftar. Gunakan ID unik lain.`);
      }

      transaction.set(docRef, payload);

      const actRef = doc(collection(db, "activities"));
      transaction.set(actRef, activityPayload);

      return {
        success: true,
        channelId: kode,
      };
    });
  } catch (error) {
    console.error("createMasterChannel error:", error);
    return {
      success: false,
      error: error.message || "Gagal mendaftarkan channel ke Firestore.",
    };
  }
}

/**
 * TAHAP 1: ATOMIC STOCK RESERVATION (BOOKING / STATUS: DIPROSES)
 * Mengunci ketersediaan stok secara aman dari race condition (overselling prevention).
 * Jika stok tersisa 1 dan ada 2 order bersamaan, tepat 1 order yang berhasil dan lainnya ditolak.
 *
 * @param {Object} params
 * @param {string} params.sku - SKU barang
 * @param {number} params.requestedQty - Jumlah yang diminta dipesan
 * @param {string} params.orderId - ID Pesanan / Referensi Dokumen
 * @param {string} [params.channel] - Channel Marketplace / Offline
 * @param {string} [params.customer] - Nama pembeli
 * @returns {Promise<{ success: boolean, availableStock?: number, reservedStock?: number, error?: string }>}
 */
export async function reserveStockAtomic({
  sku,
  requestedQty,
  orderId,
  channel = "Direct Order",
  customer = "Customer",
}) {
  const qty = parseInt(requestedQty, 10);
  if (isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah quantity pesanan tidak valid." };
  }

  const userEmail = auth.currentUser?.email || "system";
  const docId = String(sku).trim().toUpperCase();
  const itemRef = doc(db, "inventory", docId);
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Produk dengan SKU ${docId} tidak ditemukan di gudang.`);
      }

      const itemData = itemSnap.data();
      const currentAvailable = itemData.availableStock || 0;
      const currentReserved = itemData.reservedStock || 0;
      const currentTotal = itemData.totalStock || 0;
      const minStock = itemData.minimumStock || 20;

      // ATOMIC GUARD: Cegah race condition & overselling!
      if (currentAvailable < qty) {
        throw new Error(
          `Stok tidak mencukupi! Tersisa ${currentAvailable} pcs, diminta ${qty} pcs untuk pesanan #${orderId}.`
        );
      }

      const newAvailable = currentAvailable - qty;
      const newReserved = currentReserved + qty;

      // Hitung status kesehatan
      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      // Update dokumen inventaris secara atomic
      transaction.update(itemRef, {
        availableStock: newAvailable,
        reservedStock: newReserved,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // Catat log pergerakan stok (Stock Movement)
      const movementRef = doc(movementsCol);
      transaction.set(movementRef, {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: -qty,
        transactionType: "Hold / Booking",
        source: channel,
        reason: `Alokasi pesanan #${orderId} (${customer})`,
        referenceTransaction: orderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      // Catat aktivitas dashboard
      const activityRef = doc(activitiesCol);
      transaction.set(activityRef, {
        id: `ACT-${Date.now()}`,
        type: "transaction",
        title: "Stok Dibooking (Reserved)",
        description: `${qty} pcs SKU ${docId} dialokasikan ke pesanan #${orderId} via ${channel}.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "yellow",
      });

      return {
        success: true,
        sku: docId,
        orderId,
        availableStock: newAvailable,
        reservedStock: newReserved,
        totalStock: currentTotal,
      };
    });
  } catch (error) {
    console.warn("reserveStockAtomic rejected:", error.message);
    return {
      success: false,
      error: error.message || "Gagal mengalokasikan stok pesanan.",
    };
  }
}

/**
 * TAHAP 2: ATOMIC STOCK FULFILLMENT (PENGIRIMAN / STATUS: SELESAI)
 * Fisik barang resmi keluar dari gudang setelah scan barcode / packing.
 * Mengurangi reservedStock dan totalStock secara atomic.
 *
 * @param {Object} params
 * @param {string} params.sku - SKU barang
 * @param {number} params.fulfilledQty - Jumlah barang yang dikirim
 * @param {string} params.orderId - ID Pesanan
 * @returns {Promise<{ success: boolean, totalStock?: number, reservedStock?: number, error?: string }>}
 */
export async function fulfillStockAtomic({
  sku,
  fulfilledQty,
  orderId,
  trackingNumber = "",
  courier = "Kurir",
}) {
  const qty = parseInt(fulfilledQty, 10);
  if (isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah quantity pengiriman tidak valid." };
  }

  const userEmail = auth.currentUser?.email || "system";
  const docId = String(sku).trim().toUpperCase();
  const itemRef = doc(db, "inventory", docId);
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Produk dengan SKU ${docId} tidak ditemukan.`);
      }

      const itemData = itemSnap.data();
      const currentTotal = itemData.totalStock || 0;
      const currentReserved = itemData.reservedStock || 0;

      const newTotal = Math.max(0, currentTotal - qty);
      const newReserved = Math.max(0, currentReserved - qty);

      transaction.update(itemRef, {
        totalStock: newTotal,
        reservedStock: newReserved,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // Catat log barang keluar resmi
      const movementRef = doc(movementsCol);
      transaction.set(movementRef, {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: -qty,
        transactionType: "Goods Issue (Fulfillment)",
        source: "Warehouse Hub",
        reason: `Pengiriman pesanan #${orderId} (${courier} - ${trackingNumber || "No Resi"})`,
        referenceTransaction: orderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      // Catat audit log
      const activityRef = doc(activitiesCol);
      transaction.set(activityRef, {
        id: `ACT-${Date.now()}`,
        type: "fulfillment",
        title: "Barang Keluar (Fulfillment Selesai)",
        description: `${qty} pcs SKU ${docId} telah dikirim untuk pesanan #${orderId}.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "yellow",
      });

      return {
        success: true,
        sku: docId,
        orderId,
        totalStock: newTotal,
        reservedStock: newReserved,
      };
    });
  } catch (error) {
    console.error("fulfillStockAtomic error:", error);
    return {
      success: false,
      error: error.message || "Gagal mencatat pengeluaran fisik barang.",
    };
  }
}

/**
 * TAHAP 3: ATOMIC STOCK RELEASE (BATAL / ROLLBACK)
 * Mengembalikan stok yang dibooking ke availableStock jika pesanan dibatalkan / gagal bayar.
 *
 * @param {Object} params
 * @param {string} params.sku - SKU barang
 * @param {number} params.releasedQty - Jumlah yang dilepaskan kembali
 * @param {string} params.orderId - ID Pesanan
 * @param {string} [params.reason] - Alasan pembatalan
 * @returns {Promise<{ success: boolean, availableStock?: number, reservedStock?: number, error?: string }>}
 */
export async function releaseStockAtomic({
  sku,
  releasedQty,
  orderId,
  reason = "Pesanan Dibatalkan Pembeli",
}) {
  const qty = parseInt(releasedQty, 10);
  if (isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah quantity pembatalan tidak valid." };
  }

  const userEmail = auth.currentUser?.email || "system";
  const docId = String(sku).trim().toUpperCase();
  const itemRef = doc(db, "inventory", docId);
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Produk dengan SKU ${docId} tidak ditemukan.`);
      }

      const itemData = itemSnap.data();
      const currentAvailable = itemData.availableStock || 0;
      const currentReserved = itemData.reservedStock || 0;
      const minStock = itemData.minimumStock || 20;

      const newReserved = Math.max(0, currentReserved - qty);
      const newAvailable = currentAvailable + qty;

      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      transaction.update(itemRef, {
        availableStock: newAvailable,
        reservedStock: newReserved,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // Catat release movement
      const movementRef = doc(movementsCol);
      transaction.set(movementRef, {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: qty,
        transactionType: "Release / Rollback",
        source: "System",
        reason: `Pembatalan pesanan #${orderId}: ${reason}`,
        referenceTransaction: orderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      const activityRef = doc(activitiesCol);
      transaction.set(activityRef, {
        id: `ACT-${Date.now()}`,
        type: "alert",
        title: "Booking Stok Dibatalkan (Release)",
        description: `${qty} pcs SKU ${docId} dikembalikan ke stok aktif karena pesanan #${orderId} dibatalkan.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "neutral",
      });

      return {
        success: true,
        sku: docId,
        orderId,
        availableStock: newAvailable,
        reservedStock: newReserved,
      };
    });
  } catch (error) {
    console.error("releaseStockAtomic error:", error);
    return {
      success: false,
      error: error.message || "Gagal melepaskan alokasi stok.",
    };
  }
}

/**
 * PENCATATAN BARANG KELUAR ATOMIC (RACE CONDITION GUARD)
 * Mendukung 4 kategori: Fulfillment, Internal Usage, Damaged, Adjustment.
 * Mencegah overselling dan saldo minus dengan Firestore runTransaction.
 */
export async function createOutboundTransactionAtomic({
  sku,
  quantity,
  category = "internal_usage", // "fulfillment" | "internal_usage" | "damaged" | "adjustment"
  reason = "",
  recipient = "Staf Gudang",
  referenceNumber = "",
}) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah barang keluar harus lebih dari 0." };
  }

  const userEmail = auth.currentUser?.email || "system";
  const docId = String(sku).trim().toUpperCase();
  const itemRef = doc(db, "inventory", docId);
  const txCol = collection(db, "transactions");
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  const txId = referenceNumber || `OUT-${Date.now()}`;

  try {
    return await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Produk dengan SKU ${docId} tidak ditemukan di gudang.`);
      }

      const itemData = itemSnap.data();
      const currentAvailable = itemData.availableStock || 0;
      const currentTotal = itemData.totalStock || 0;
      const currentDamaged = itemData.damagedStock || 0;
      const minStock = itemData.minimumStock || 20;

      // ATOMIC CONCURRENCY GUARD:
      if (currentAvailable < qty) {
        throw new Error(
          `[RACE CONDITION DICEGAH] Stok tidak mencukupi! Sisa stok tersedia: ${currentAvailable} pcs, diminta keluar: ${qty} pcs. Transaksi dibatalkan secara aman.`
        );
      }

      let newAvailable = currentAvailable - qty;
      let newTotal = currentTotal;
      let newDamaged = currentDamaged;

      if (category === "damaged") {
        newDamaged = currentDamaged + qty;
      } else {
        newTotal = Math.max(0, currentTotal - qty);
      }

      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      // 1. Update Dokumen Inventaris
      transaction.update(itemRef, {
        availableStock: newAvailable,
        totalStock: newTotal,
        damagedStock: newDamaged,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // 2. Simpan Dokumen Transaksi Barang Keluar
      const categoryLabels = {
        fulfillment: "Fulfillment",
        internal_usage: "Internal Usage",
        damaged: "Damaged / Karantina",
        adjustment: "Adjustment Opname",
      };

      const newTxRef = doc(txCol);
      const txPayload = {
        id: txId,
        txId,
        category: "barang_keluar",
        subCategory: category,
        jenisPengeluaran: categoryLabels[category] || category,
        sku: docId,
        namaProduk: itemData.namaProduk || docId,
        quantity: -qty,
        totalPcs: `${qty} Pcs`,
        penerima: recipient,
        keterangan: reason || `Pengeluaran ${categoryLabels[category] || category}`,
        timestamp: serverTimestamp(),
        tanggal: new Date().toLocaleDateString("id-ID"),
        user: userEmail,
      };
      transaction.set(newTxRef, txPayload);

      // 3. Catat di Stock Movements
      const newMovementRef = doc(movementsCol);
      transaction.set(newMovementRef, {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: -qty,
        transactionType: `Outgoing (${categoryLabels[category] || category})`,
        source: "Warehouse Hub",
        reason: reason || `Pengeluaran ${categoryLabels[category]}`,
        referenceTransaction: txId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      // 4. Catat di Aktivitas
      const newActRef = doc(activitiesCol);
      transaction.set(newActRef, {
        id: `ACT-${Date.now()}`,
        type: "transaction",
        title: `Barang Keluar: ${categoryLabels[category] || category}`,
        description: `${qty} pcs SKU ${docId} dikeluarkan untuk ${recipient}. Sisa stok tersedia: ${newAvailable} pcs.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: category === "damaged" ? "red" : "yellow",
      });

      return {
        success: true,
        txId,
        sku: docId,
        availableStock: newAvailable,
        totalStock: newTotal,
      };
    });
  } catch (error) {
    console.error("createOutboundTransactionAtomic error:", error);
    return {
      success: false,
      error: error.message || "Gagal mencatat pengeluaran barang.",
    };
  }
}

/**
 * MEMBUAT PESANAN DENGAN ATOMIC STOCK RESERVATION (TAHAP 1: DIPROSES)
 * Mengunci ketersediaan stok fisik ke reservedStock. Jika stok sisa 1 dan ada 2 order bersamaan,
 * tepat 1 order yang berhasil dan order kedua ditolak tanpa overselling.
 */
export async function createOrderWithStockReservation({
  orderId,
  sku,
  quantity = 1,
  marketplace = "Shopee",
  channel = "Online Marketplace",
  customer = "Customer",
  kurir = "J&T Express",
  catatan = "",
}) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return { success: false, error: "Jumlah quantity pesanan tidak valid." };
  }

  const cleanOrderId = (orderId || `ORD-${Date.now().toString().slice(-6)}`).trim().toUpperCase();
  const docId = String(sku).trim().toUpperCase();
  const userEmail = auth.currentUser?.email || "system";

  const itemRef = doc(db, "inventory", docId);
  const orderRef = doc(db, "orders", cleanOrderId);
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Cek duplikasi order ID
      const orderSnap = await transaction.get(orderRef);
      if (orderSnap.exists()) {
        throw new Error(`Order ID ${cleanOrderId} sudah terdaftar sebelumnya.`);
      }

      // 2. Cek stok inventaris
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error(`Produk dengan SKU ${docId} tidak ditemukan.`);
      }

      const itemData = itemSnap.data();
      const currentAvailable = itemData.availableStock || 0;
      const currentReserved = itemData.reservedStock || 0;
      const minStock = itemData.minimumStock || 20;

      // ATOMIC CONCURRENCY GUARD:
      if (currentAvailable < qty) {
        throw new Error(
          `[RACE CONDITION DICEGAH] Stok tidak mencukupi! Tersedia: ${currentAvailable} pcs, diminta: ${qty} pcs untuk #${cleanOrderId}.`
        );
      }

      const newAvailable = currentAvailable - qty;
      const newReserved = currentReserved + qty;

      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      // 3. Update inventaris: kunci stok
      transaction.update(itemRef, {
        availableStock: newAvailable,
        reservedStock: newReserved,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // 4. Buat dokumen order di koleksi orders
      const orderPayload = {
        orderId: cleanOrderId,
        sku: docId,
        namaProduk: itemData.namaProduk || docId,
        quantity: qty,
        marketplace,
        channel,
        customer,
        kurir,
        catatan,
        status: "Diproses (Reserved)",
        stageId: "STAGE_2",
        waktuPesan: new Date().toLocaleString("id-ID"),
        createdAt: serverTimestamp(),
        reservedAt: serverTimestamp(),
        createdBy: userEmail,
      };
      transaction.set(orderRef, orderPayload);

      // 5. Catat log movement
      const movementRef = doc(movementsCol);
      transaction.set(movementRef, {
        movementId: `MOV-${Date.now()}`,
        sku: docId,
        quantity: -qty,
        transactionType: "Hold / Booking",
        source: marketplace,
        reason: `Alokasi pesanan #${cleanOrderId} (${customer})`,
        referenceTransaction: cleanOrderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      // 6. Catat aktivitas
      const activityRef = doc(activitiesCol);
      transaction.set(activityRef, {
        id: `ACT-${Date.now()}`,
        type: "transaction",
        title: "Pesanan Baru Diterima & Stok Dibooking",
        description: `Order #${cleanOrderId} mengunci ${qty} pcs SKU ${docId} dari ${marketplace}.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "yellow",
      });

      return {
        success: true,
        orderId: cleanOrderId,
        sku: docId,
        availableStock: newAvailable,
        reservedStock: newReserved,
      };
    });
  } catch (error) {
    console.error("createOrderWithStockReservation error:", error);
    return {
      success: false,
      error: error.message || "Gagal membuat pesanan dan membooking stok.",
    };
  }
}

/**
 * FULFILL ORDER SECARA ATOMIC (TAHAP 2: SELESAI / PENGIRIMAN FISIK)
 */
export async function fulfillOrderAtomic(orderId, { trackingNumber = "", kurir = "" } = {}) {
  const userEmail = auth.currentUser?.email || "system";
  const orderRef = doc(db, "orders", String(orderId).trim().toUpperCase());
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error(`Pesanan #${orderId} tidak ditemukan.`);
      }

      const orderData = orderSnap.data();
      if (orderData.status === "Completed") {
        throw new Error(`Pesanan #${orderId} sudah selesai diproses sebelumnya.`);
      }
      if (orderData.status === "Cancelled") {
        throw new Error(`Pesanan #${orderId} sudah dibatalkan, tidak dapat dikirim.`);
      }

      const sku = orderData.sku;
      const qty = parseInt(orderData.quantity || 1, 10);
      const itemRef = doc(db, "inventory", sku);
      const itemSnap = await transaction.get(itemRef);

      if (!itemSnap.exists()) {
        throw new Error(`Item inventaris untuk SKU ${sku} tidak ditemukan.`);
      }

      const itemData = itemSnap.data();
      const currentReserved = itemData.reservedStock || 0;
      const currentTotal = itemData.totalStock || 0;

      const newReserved = Math.max(0, currentReserved - qty);
      const newTotal = Math.max(0, currentTotal - qty);

      // Update inventaris
      transaction.update(itemRef, {
        totalStock: newTotal,
        reservedStock: newReserved,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      // Update order
      transaction.update(orderRef, {
        status: "Completed",
        stageId: "STAGE_6",
        nomorResi: trackingNumber || `RESI-${Date.now().toString().slice(-8)}`,
        kurir: kurir || orderData.kurir || "Kurir",
        completedAt: serverTimestamp(),
        tanggal: new Date().toLocaleDateString("id-ID"),
        updatedBy: userEmail,
      });

      // Movement log
      const movRef = doc(movementsCol);
      transaction.set(movRef, {
        movementId: `MOV-${Date.now()}`,
        sku,
        quantity: -qty,
        transactionType: "Goods Issue (Fulfillment)",
        source: "Warehouse Hub",
        reason: `Pesanan #${orderId} telah dikirim dan diserahkan ke kurir`,
        referenceTransaction: orderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      // Activity log
      const actRef = doc(activitiesCol);
      transaction.set(actRef, {
        id: `ACT-${Date.now()}`,
        type: "fulfillment",
        title: "Pesanan Dikirim (Fulfillment Selesai)",
        description: `Order #${orderId} (${qty} pcs SKU ${sku}) telah dikirim. Stok fisik diperbarui.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "yellow",
      });

      return {
        success: true,
        orderId,
        totalStock: newTotal,
        reservedStock: newReserved,
      };
    });
  } catch (error) {
    console.error("fulfillOrderAtomic error:", error);
    return {
      success: false,
      error: error.message || "Gagal menyelesaikan pengiriman pesanan.",
    };
  }
}

/**
 * BATALKAN PESANAN SECARA ATOMIC (TAHAP 3: ROLLBACK RESERVED STOCK)
 */
export async function cancelOrderAtomic(orderId, reason = "Dibatalkan oleh Pelanggan / Admin") {
  const userEmail = auth.currentUser?.email || "system";
  const orderRef = doc(db, "orders", String(orderId).trim().toUpperCase());
  const movementsCol = collection(db, "stock_movements");
  const activitiesCol = collection(db, "activities");

  try {
    return await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error(`Pesanan #${orderId} tidak ditemukan.`);
      }

      const orderData = orderSnap.data();
      if (orderData.status === "Cancelled") {
        throw new Error(`Pesanan #${orderId} sudah dibatalkan sebelumnya.`);
      }
      if (orderData.status === "Completed") {
        throw new Error(`Pesanan #${orderId} sudah berstatus selesai/terkirim.`);
      }

      const sku = orderData.sku;
      const qty = parseInt(orderData.quantity || 1, 10);
      const itemRef = doc(db, "inventory", sku);
      const itemSnap = await transaction.get(itemRef);

      if (!itemSnap.exists()) {
        throw new Error(`Item inventaris untuk SKU ${sku} tidak ditemukan.`);
      }

      const itemData = itemSnap.data();
      const currentAvailable = itemData.availableStock || 0;
      const currentReserved = itemData.reservedStock || 0;
      const minStock = itemData.minimumStock || 20;

      const newReserved = Math.max(0, currentReserved - qty);
      const newAvailable = currentAvailable + qty;

      let statusKesehatan = "Aman";
      if (newAvailable <= minStock / 2) {
        statusKesehatan = "Kritis / Menipis";
      } else if (newAvailable <= minStock) {
        statusKesehatan = "Peringatan Menipis";
      }

      transaction.update(itemRef, {
        availableStock: newAvailable,
        reservedStock: newReserved,
        statusKesehatan,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      transaction.update(orderRef, {
        status: "Cancelled",
        stageId: "CANCELLED",
        cancelReason: reason,
        cancelledAt: serverTimestamp(),
        updatedBy: userEmail,
      });

      const movRef = doc(movementsCol);
      transaction.set(movRef, {
        movementId: `MOV-${Date.now()}`,
        sku,
        quantity: qty,
        transactionType: "Release / Rollback",
        source: "System",
        reason: `Rollback pesanan #${orderId}: ${reason}`,
        referenceTransaction: orderId,
        user: userEmail,
        timestamp: serverTimestamp(),
      });

      const actRef = doc(activitiesCol);
      transaction.set(actRef, {
        id: `ACT-${Date.now()}`,
        type: "alert",
        title: "Pesanan Dibatalkan & Stok Dikembalikan",
        description: `Order #${orderId} dibatalkan. ${qty} pcs SKU ${sku} dikembalikan ke stok aktif.`,
        timestamp: serverTimestamp(),
        user: userEmail,
        badgeVariant: "neutral",
      });

      return {
        success: true,
        orderId,
        availableStock: newAvailable,
        reservedStock: newReserved,
      };
    });
  } catch (error) {
    console.error("cancelOrderAtomic error:", error);
    return {
      success: false,
      error: error.message || "Gagal membatalkan pesanan.",
    };
  }
}

/**
 * SIMULASI RACE CONDITION STRESS TEST (2 PENGGUNA BERSAMAAN CHECKOUT STOK TERAKHIR)
 * Mengeksekusi 2 Promise secara paralel (timestamp yang sama persis)
 * Membuktikan bahwa tepat 1 transaksi yang berhasil dan 1 transaksi lainnya ditolak dengan aman.
 */
export async function simulateRaceConditionTest({ sku }) {
  const docId = String(sku).trim().toUpperCase();
  const testId = Date.now().toString().slice(-4);
  const orderIdA = `SIM-${testId}-A`;
  const orderIdB = `SIM-${testId}-B`;

  const threadA = createOrderWithStockReservation({
    orderId: orderIdA,
    sku: docId,
    quantity: 1,
    marketplace: "Shopee API (Channel 1)",
    channel: "Marketplace Flash Sale",
    customer: "User A (Shopee Checkout)",
    kurir: "J&T Express",
    catatan: "Simulasi Race Condition Thread A",
  });

  const threadB = createOrderWithStockReservation({
    orderId: orderIdB,
    sku: docId,
    quantity: 1,
    marketplace: "TikTok Shop API (Channel 2)",
    channel: "Live Shopping Flash Sale",
    customer: "User B (TikTok Checkout)",
    kurir: "SiCepat",
    catatan: "Simulasi Race Condition Thread B",
  });

  const [resultA, resultB] = await Promise.all([threadA, threadB]);

  return {
    testedSku: docId,
    orderIdA,
    orderIdB,
    threadA: resultA,
    threadB: resultB,
    raceConditionPrevented: (resultA.success && !resultB.success) || (!resultA.success && resultB.success),
    summary:
      resultA.success && resultB.success
        ? "Catatan: Kedua order berhasil karena stok tersedia awalnya >= 2 pcs."
        : resultA.success && !resultB.success
        ? `BERHASIL DICEGAH! User A (Shopee) berhasil mengunci order #${orderIdA}, sementara User B (TikTok) ditolak: "${resultB.error}". Tidak ada overselling!`
        : !resultA.success && resultB.success
        ? `BERHASIL DICEGAH! User B (TikTok) berhasil mengunci order #${orderIdB}, sementara User A (Shopee) ditolak: "${resultA.error}". Tidak ada overselling!`
        : `Kedua order ditolak karena stok tersedia memang sudah 0 pcs.`,
  };
}


