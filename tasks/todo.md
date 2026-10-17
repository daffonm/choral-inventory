# Tasks Checklist: Firebase Realtime Backend & Auth Hardening

**Reference Plan:** [`tasks/plan.md`](plan.md)  
**Reference Spec:** [`docs/specs/SPEC-firebase-realtime.md`](../docs/specs/SPEC-firebase-realtime.md)  

---

## Phase 1: Authentication & Adaptive Session (`auth-session`)

## Task 1: Setup Auth Service & Firebase Helpers
**Description:** Membuat helper autentikasi di `src/lib/firebase/auth-service.js` yang menyediakan fungsi login dengan pemilihan persistensi (`browserLocalPersistence` jika `keepSignedIn` true, `browserSessionPersistence` jika false), fungsi logout, dan helper status user.

**Acceptance criteria:**
- [x] `loginUser(email, password, keepSignedIn)` mengeset persistence sesuai pilihan sebelum autentikasi
- [x] `logoutUser()` memanggil `signOut` dari Firebase Auth
- [x] Error Firebase Auth ditangkap dan diterjemahkan menjadi pesan error yang ramah pengguna

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Fungsi auth dapat diimpor tanpa syntax error

**Dependencies:** None  
**Files likely touched:**
- `src/lib/firebase/auth-service.js`
- `src/lib/firebase/index.js`
**Estimated scope:** S (1-2 files)

---

## Task 2: Buat `AuthProvider` & `useAuth` Hook dengan Route Guarding
**Description:** Membuat React Context provider di `src/components/providers/AuthProvider.jsx` untuk mendistribusikan `currentUser`, `userProfile`, `authLoading`, fungsi login, dan logout ke seluruh komponen aplikasi.

**Acceptance criteria:**
- [x] `onAuthStateChanged` mendeteksi perubahan sesi login secara reaktif
- [x] `useAuth()` mengembalikan user state dan status loading
- [x] `AuthProvider` dibungkuskan ke dalam `RootLayout` di `src/app/layout.js`

**Verification:**
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 1  
**Files likely touched:**
- `src/components/providers/AuthProvider.jsx`
- `src/app/layout.js`
**Estimated scope:** S (2 files)

---

## Task 3: Buat Halaman Login Tactical di `/login` dengan Checkbox "Keep me signed in" dan Update `AppShell`
**Description:** Membuat halaman login di `src/app/login/page.js` dengan form email, password, dan checkbox "Keep me signed in". Update `AppShell.jsx` agar sidebar dan header disembunyikan saat user berada di rute `/login`.

**Acceptance criteria:**
- [x] Rute `/login` menampilkan form login berestetika tactical dark khas CHORAL.ID
- [x] Checkbox "Keep me signed in / Tetap masuk di perangkat ini" tersedia dan berfungsi
- [x] Jika user berhasil login, otomatis redirect ke `/persediaan` atau `/dashboard`
- [x] `AppShell` tidak menampilkan sidebar & header di halaman `/login`

**Verification:**
- [x] Manual check: Navigasi ke `/login` menampilkan form login bersih
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 2  
**Files likely touched:**
- `src/app/login/page.js`
- `src/components/auth/LoginForm.jsx`
- `src/components/layout/AppShell.jsx`
**Estimated scope:** M (3 files)

---

## Task 4: Tambahkan Tombol User Profile & Logout di `AppHeader` / `Sidebar`
**Description:** Mengintegrasikan tombol logout dan info user aktif ke `AppHeader` atau `Sidebar` agar pengguna bisa keluar dari sesi kapan saja.

**Acceptance criteria:**
- [x] Email user yang sedang login ditampilkan di header/sidebar
- [x] Tombol logout memanggil `logoutUser()` dan me-redirect ke `/login`

**Verification:**
- [x] Manual check: Klik tombol logout berhasil mengakhiri sesi dan redirect ke login
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 3  
**Files likely touched:**
- `src/components/layout/AppHeader.jsx`
- `src/components/layout/Sidebar.jsx`
**Estimated scope:** S (2 files)

---

## Checkpoint: Foundation (Tasks 1-4)
- [x] Alur login dan logout bekerja end-to-end
- [x] Rute privat terlindungi dari unauthorized access
- [x] Aplikasi lulus `npm run build`

---

## Phase 2: Security & Hardening (`security-rules`)

## Task 5: Buat File `firestore.rules` dengan Definisi STRIDE Hardening & Data Validation
**Description:** Membuat file `firestore.rules` di root project yang mengimplementasikan aturan keamanan STRIDE: default deny, require authentication untuk inventaris, validasi tipe data stok (`totalStock is int && totalStock >= 0`), dan audit trail immutability untuk mutasi stok.

**Acceptance criteria:**
- [x] File `firestore.rules` tersimpan di root project dan terdokumentasi
- [x] Aturan memblokir unauthenticated read & write
- [x] Aturan memvalidasi data stok non-negatif

**Verification:**
- [x] File check: `firestore.rules` ada dan valid syntax rules version 2

**Dependencies:** None  
**Files likely touched:**
- `firestore.rules`
**Estimated scope:** S (1 file)

---

## Checkpoint: Security (Task 5)
- [x] Rules file siap disalin ke Firebase Console

---

## Phase 3: Modular Batch Importer & Data Migration (`realtime-inventory`)

## Task 6: Buat `inventory-service.js` dengan Fungsi Modular `importInventoryRecords` & `seedInventoryFromDummy`
**Description:** Membuat service `src/lib/firebase/inventory-service.js` yang menyediakan fungsi `importInventoryRecords(records, options)` menggunakan Firestore `writeBatch`. Fungsi ini menerima array objek barang (yang siap menerima data parsing XLSX/CSV di masa depan) serta fungsi helper `seedInventoryFromDummy()` yang memetakan data dari `dummyData.js` dengan tambahan field `barcode`.

**Acceptance criteria:**
- [x] `importInventoryRecords` melakukan batch write ke koleksi `inventory` di Firestore
- [x] Field dokumen mencakup `sku`, `barcode`, `namaProduk`, `totalStock`, `availableStock`, `reservedStock`, `damagedStock`, `lokasiGudang`, `statusKesehatan`, `minimumStock`, `updatedAt`, `updatedBy`
- [x] Fungsi modular dan siap menerima data dari file reader XLSX/CSV nantinya

**Verification:**
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 5  
**Files likely touched:**
- `src/lib/firebase/inventory-service.js`
**Estimated scope:** S (1-2 files)

---

## Task 7: Sediakan UI Trigger Seed / Import di Admin Settings dengan Indikator Loading & Feedback
**Description:** Menambahkan tombol "Inisialisasi Data Inventaris Awal" di `SettingsView.jsx` (atau `MasterDataView.jsx`) yang memanggil `seedInventoryFromDummy()` dengan status loading dan alert konfirmasi sukses.

**Acceptance criteria:**
- [x] Tombol import data awal tersedia di antarmuka pengaturan/master data
- [x] Menampilkan pesan sukses setelah data berhasil masuk ke Firestore
- [x] Menangani error dengan alert yang informatif jika proses gagal

**Verification:**
- [x] Manual check: Tombol dapat diklik dan memberikan feedback visual yang jelas
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 6  
**Files likely touched:**
- `src/components/views/SettingsView.jsx`
**Estimated scope:** S (1 file)

---

## Checkpoint: Data & Importer (Tasks 6-7)
- [x] Firestore berhasil terisi data awal inventaris
- [x] Abstraksi importer siap untuk integrasi file upload XLSX/CSV

---

## Phase 4: Realtime Inventory Sync & UI Integration (`realtime-inventory`)

## Task 8: Buat Hook `useRealtimeInventory` menggunakan Firestore `onSnapshot`
**Description:** Membuat React custom hook di `src/lib/firebase/useRealtimeInventory.js` yang mendengarkan koleksi `inventory` secara realtime via listener `onSnapshot`, dengan fallback otomatis ke `dummyData.js` jika koneksi database kosong atau offline.

**Acceptance criteria:**
- [x] Hook mengembalikan `{ items, loading, error, isLive }`
- [x] Listener ter-unsubscribe secara otomatis saat komponen unmount untuk menghindari memory leak
- [x] Jika data Firestore ada, gunakan data Firestore live; jika kosong, sediakan fallback transparan

**Verification:**
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 6  
**Files likely touched:**
- `src/lib/firebase/useRealtimeInventory.js`
**Estimated scope:** S (1 file)

---

## Task 9: Hubungkan `useRealtimeInventory` ke `PersediaanView`
**Description:** Memperbarui `src/components/views/PersediaanView.jsx` agar mengonsumsi data dari `useRealtimeInventory()` menggantikan data statis lokal, sehingga tabel stok dan badge status (Aman/Menipis/Kritis) terupdate secara realtime saat data berubah.

**Acceptance criteria:**
- [x] Tabel `Stok Saat Ini` menampilkan data live dari Firestore
- [x] Status badge (Aman / Menipis / Kritis) dihitung reaktif berdasarkan perbandingan `availableStock` dan buffer minimum
- [x] Ditambahkan indikator visual "● Realtime Connected" di header tabel

**Verification:**
- [x] Manual check: Tabel persediaan menampilkan data dengan status live
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 8  
**Files likely touched:**
- `src/components/views/PersediaanView.jsx`
**Estimated scope:** S (1 file)

---

## Task 10: Hubungkan Ringkasan Stok Realtime ke KPI Card di `DashboardView`
**Description:** Menghubungkan total stok, stok menipis, dan ringkasan persediaan di `DashboardView.jsx` dengan data realtime agar angka kartu monitoring sinkron dengan kondisi fisik di gudang.

**Acceptance criteria:**
- [x] KPI Card Total Stok dan Stok Menipis di Dashboard merefleksikan agregat data live dari Firestore
- [x] Dashboard langsung beradaptasi saat ada mutasi stok di inventaris

**Verification:**
- [x] Build succeeds: `npm run build`

**Dependencies:** Task 9  
**Files likely touched:**
- `src/components/views/DashboardView.jsx`
**Estimated scope:** S (1 file)

---

## Checkpoint: Realtime Sync (Tasks 8-10)
- [x] Data stok live di tabel persediaan dan dashboard
- [x] Perubahan data di Firestore langsung terlihat seketika tanpa refresh browser

---

## Phase 5: Verification & Quality Assurance

## Task 11: End-to-end Verification & Build Check
**Description:** Menjalankan verifikasi penuh terhadap kode yang ditulis: menjalankan `npm run build`, memeriksa linting dengan `npm run lint`, memastikan semua env variable bersih, dan menguji alur auth serta realtime secara menyeluruh.

**Acceptance criteria:**
- [x] `npm run build` selesai tanpa error (Exit code 0, 34/34 static routes compiled)
- [x] `npm run lint` tidak menghasilkan error kritis (Exit code 0, 0 errors, 0 warnings)
- [x] Tidak ada kredensial atau secret yang bocor ke git tracking (.env.local gitignored)

**Verification:**
- [x] Command: `npm run build` (Verified)
- [x] Command: `npm run lint` (Verified)

**Dependencies:** Task 10  
**Files likely touched:**
- Berbagai file dalam project bila ada linting/type issue
**Estimated scope:** S (1-2 files)

---

## Checkpoint: Complete (All Phases)
- [x] Semua acceptance criteria pada spesifikasi terpenuhi
- [x] Sistem autentikasi dengan checkbox "Keep me signed in" berjalan aktif
- [x] Route guard memblokir akses unauthorized ke dashboard/persediaan
- [x] Security rules Firestore terdefinisi dengan STRIDE hardening
- [x] Modular importer siap digunakan (termasuk migrasi dummy awal & kesiapan XLSX/CSV)
- [x] Realtime sync onSnapshot aktif di PersediaanView dan DashboardView
- [x] Seluruh build & linting lolos 100% tanpa error

