# Implementation Plan: Firebase Realtime Backend & Auth Hardening

**Reference Spec:** [`docs/specs/SPEC-firebase-realtime.md`](../docs/specs/SPEC-firebase-realtime.md)  
**Status:** COMPLETED (All 5 Slices Built & Verified)  
**Estimated Slices:** 5 Vertical Slices  

---

## Overview
Implementasi backend Firebase Client SDK untuk CHORAL.ID mencakup autentikasi dengan persistensi sesi adaptif ("Keep me signed in" vs session-only), Firestore Security Rules yang memblokir total unauthorized access dan memvalidasi tipe data stok, layanan batch import inventaris yang modular (siap menerima data CSV/XLSX), serta hook sinkronisasi data realtime (`onSnapshot`) yang terintegrasi langsung ke tabel `PersediaanView`.

---

## Architecture Decisions
1. **Client-First Firebase Architecture:**
   Menggunakan murni Firebase Client SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`). Tidak memerlukan Admin SDK atau server terpisah, menjaga biaya tetap $0 (Spark Free-Tier).
2. **Sesi Adaptif via Firebase Auth:**
   Memanfaatkan `setPersistence` dengan `browserLocalPersistence` (jika user mencentang "Keep me signed in" di HP/PC pribadi) vs `browserSessionPersistence` (jika tidak dicentang di PC bersama).
3. **Route Guarding di Client Level:**
   `AuthProvider` membungkus aplikasi dan mendeteksi rute privat. Jika unauthenticated, user di-redirect ke `/login`. Pada halaman `/login`, `AppShell` (sidebar/header) disembunyikan agar tampilan bersih dan fokus.
4. **Modular Batch Importer:**
   Layanan `inventory-service.js` dirancang dengan antarmuka `importInventoryRecords(records, options)` yang mengabstraksi sumber data (bisa dari dummy data saat ini atau hasil parsing file CSV/XLSX di masa depan) menggunakan Firestore `writeBatch`.
5. **Zero-Latency Realtime Updates:**
   Hook `useRealtimeInventory` menggunakan listener Firestore `onSnapshot` yang langsung memperbarui state React saat data di database berubah, lengkap dengan cleanup listener saat unmount.

---

## Task List

### Phase 1: Authentication & Adaptive Session (`auth-session`)
- [x] Task 1: Setup Auth Service & Firebase Helpers (`auth-service.js`)
- [x] Task 2: Buat `AuthProvider` & `useAuth` Hook dengan Route Guarding
- [x] Task 3: Buat Halaman Login Tactical di `/login` dengan Checkbox "Keep me signed in" dan Update `AppShell`
- [x] Task 4: Tambahkan Tombol User Profile & Logout di `AppHeader` / `Sidebar`

### Checkpoint: Authentication & Sesi
- [x] User bisa login dan logout
- [x] Rute terproteksi me-redirect user yang belum login ke `/login`
- [x] Pilihan "Keep me signed in" membedakan persistensi lokal vs sesi
- [x] `npm run build` sukses tanpa error

### Phase 2: Security & Hardening (`security-rules`)
- [x] Task 5: Buat File `firestore.rules` dengan Definisi STRIDE Hardening & Data Validation

### Checkpoint: Security
- [x] Aturan keamanan Firestore terdefinisi dan siap dideploy ke Firebase Console

### Phase 3: Modular Batch Importer & Data Migration (`realtime-inventory`)
- [x] Task 6: Buat `inventory-service.js` dengan fungsi `importInventoryRecords` (Siap CSV/XLSX) & `seedInventoryFromDummy`
- [x] Task 7: Sediakan UI Trigger Seed / Import di Admin Settings dengan Indikator Loading & Feedback

### Checkpoint: Data & Importer
- [x] Koleksi `inventory` di Firestore dapat terisi data dengan format lengkap (termasuk field `barcode`)
- [x] Fungsi importer modular siap dipasangi file uploader CSV/XLSX

### Phase 4: Realtime Inventory Sync & UI Integration (`realtime-inventory`)
- [x] Task 8: Buat Hook `useRealtimeInventory` menggunakan Firestore `onSnapshot`
- [x] Task 9: Hubungkan `useRealtimeInventory` ke `PersediaanView` (Tabel Stok Saat Ini & Badge Status Kesehatan)
- [x] Task 10: Hubungkan Ringkasan Stok Realtime ke KPI Card di `DashboardView`

### Checkpoint: Realtime Sync
- [x] Perubahan data di Firestore langsung merefleksikan perubahan di tabel persediaan tanpa reload
- [x] Badge status stok (Aman / Menipis / Kritis) bereaksi secara instan

### Phase 5: Verification & Quality Assurance
- [x] Task 11: End-to-end Verification & Build Check (`npm run build`, `npm run lint`)

### Checkpoint: Complete
- [x] Semua acceptance criteria pada spesifikasi terpenuhi
- [x] Aplikasi berjalan stabil dan siap digunakan tim gudang

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Kuota Read Firestore bengkak karena loop listener | Sedang | Gunakan satu listener di level provider atau komponen utama, hindari instansiasi listener ganda pada komponen child. |
| Memory leak dari `onSnapshot` yang tidak di-unsubscribe | Rendah | Selalu return fungsi `unsubscribe()` di dalam cleanup `useEffect`. |
| Unauthenticated user melihat kedipan UI sebelum redirect | Rendah | Tampilkan skeleton/loading state selama `authLoading` bernilai `true`. |
