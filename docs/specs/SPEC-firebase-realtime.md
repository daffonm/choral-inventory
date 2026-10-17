# Spec: Firebase Realtime Backend & Auth Hardening

**Document ID:** `SPEC-firebase-realtime`  
**Status:** APPROVED (Validated by User)  
**Reference Intent:** [`docs/intent/firebase-realtime-inventory.md`](../intent/firebase-realtime-inventory.md)  
**Authors:** AI Agent & Head of Engineering  

---

## 1. Problem Statement & Idea Refinement (`idea-refine`)

### How Might We
> *Bagaimana kita menyediakan sistem pemantauan persediaan barang secara realtime dengan latensi nol untuk 1–4 pengguna operasional tanpa biaya server (100% Spark Free-Tier), sambil memastikan akses unauthorized diblokir total dan sesi login fleksibel untuk operasional PC vs mobile barcode scanner di masa depan?*

### MVP Scope vs Not Doing
| In-Scope (MVP) | Not Doing (and Why) |
|---|---|
| Firebase Client SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`) | **Firebase Admin SDK & Service Account Key**: Tidak diperlukan di browser, meminimalkan kompleksitas & risiko kebocoran key. |
| Checkbox "Keep me signed in" (`browserLocalPersistence` vs `browserSessionPersistence`) | **Custom Backend / Server WebSockets**: Boros biaya & overhead maintenance; Firestore `onSnapshot` sudah out-of-the-box. |
| Proteksi rute dari Unauthorized di level client (`useAuth` + redirect guard) | **Firebase Cloud Functions**: Menghindari kewajiban kartu kredit / Blaze billing plan. |
| Firestore Security Rules (`firestore.rules`) untuk validasi data & proteksi akses | **Notifikasi Bot Telegram / Web Push**: Ditunda ke fase berikutnya agar fokus pada keandalan sinkronisasi data internal. |
| Skema koleksi `inventory` & `stock_movements` menyertakan `barcode` & `sku` | **Hardware Barcode Gun**: Kamera HP akan dimanfaatkan pada fase lanjutan via route khusus. |
| Listener `onSnapshot` terintegrasi langsung ke `PersediaanView` | **Registrasi Pengguna Publik**: Akun 1–4 staf dibuat manual di Firebase Console demi keamanan internal. |

---

## 2. Phase 0: Capability Map (`spec-driven-development`)

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────────┐
│  auth-session   │ ────> │  security-rules │ ────> │  realtime-inventory  │
│  (Auth & Sesi)  │       │ (Firestore Sec) │       │ (Live Data & UI Sync)│
└─────────────────┘       └─────────────────┘       └──────────────────────┘
```

| Module ID | Tanggung Jawab | Dependensi |
|---|---|---|
| `auth-session` | Inisialisasi Firebase Auth, halaman Login, kontrol persistensi ("Keep me signed in"), `AuthProvider` & `useAuth` hook, dan proteksi rute dari unauthorized user. | — |
| `security-rules` | Definisi aturan keamanan Firestore (`firestore.rules`), pemblokiran akses unauthenticated, validasi integritas data stok (non-negatif, tipe data), dan pemisahan role dasar. | `auth-session` |
| `realtime-inventory` | Skema koleksi Firestore (`inventory`, `stock_movements`), hook `useRealtimeInventory` via `onSnapshot`, skrip seed migrasi awal dari `dummyData.js`, dan binding live ke `PersediaanView`. | `security-rules` |

**Build Order:** `auth-session` ➔ `security-rules` ➔ `realtime-inventory`

---

## 3. Threat Model & Security Hardening (`security-and-hardening`)

### STRIDE Assessment

| Threat | Risiko Spesifik di Choral Inventory | Mitigasi Wajib |
|---|---|---|
| **Spoofing** | Penyerang atau orang luar mengakses dashboard stok tanpa login. | Firebase Auth ID token validation; `request.auth != null` di semua rules Firestore; Redirect otomatis ke `/login` jika session null. |
| **Tampering** | User memanipulasi angka stok menjadi minus atau mengubah ID transaksi langsung via console. | Aturan validasi Firestore: `request.resource.data.totalStock is int && request.resource.data.totalStock >= 0`. Field `sku` dan `id` immutable. |
| **Repudiation** | Ada barang keluar/hilang tapi tidak terlacak siapa yang mengurangi stok. | Setiap mutasi wajib menyertakan audit trail: `updatedBy: request.auth.uid`, `updatedAt: request.time`, dan pencatatan riwayat di sub-koleksi/koleksi `stock_movements`. |
| **Information Disclosure** | Data vendor, HPP, atau jumlah stok bocor ke publik. | Aturan default Firestore: `allow read, write: if false;`. Baca data inventaris hanya diizinkan untuk authenticated users. |
| **Denial of Service** | Script bot mengeksekusi jutaan query write yang menghabiskan kuota Spark (20k write/hari). | Validasi skema ketat; payload dibatasi hanya untuk field terdaftar; operasi write hanya lewat form tervalidasi. |
| **Elevation of Privilege** | Staf biasa mencoba menghapus SKU barang atau mengedit role user lain. | Hak hapus (`delete`) hanya diizinkan jika `request.auth.token.role == 'admin'` atau user tercatat sebagai admin. |

### Firestore Security Rules Specification (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fungsi bantuan
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isValidStockItem() {
      let data = request.resource.data;
      return data.sku is string && data.sku.size() > 0
          && data.totalStock is int && data.totalStock >= 0
          && data.availableStock is int && data.availableStock >= 0
          && data.namaProduk is string;
    }

    // 1. Koleksi Inventaris / Persediaan
    match /inventory/{itemId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && isValidStockItem();
      allow delete: if isAuthenticated() && request.auth.token.email.matches('.*@choral\\.id'); // Atau role admin
    }

    // 2. Koleksi Mutasi / Pergerakan Stok
    match /stock_movements/{movementId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() 
                    && request.resource.data.quantity is int
                    && request.resource.data.sku is string;
      allow update, delete: if false; // Riwayat mutasi bersifat immutable (tidak boleh diedit/dihapus)
    }

    // Default deny untuk koleksi lainnya
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Tech Stack & Execution Commands

### Tech Stack
- **Framework:** Next.js `16.4.0` (App Router, Turbopack)
- **Runtime & Language:** React `19.3.0`, JavaScript (ES2024 / Node 20+)
- **Styling:** Tailwind CSS `v4` with CSS Variables
- **Backend / Database:** Firebase Client SDK `^13.0.0` (Firebase Auth & Cloud Firestore)

### Commands
- **Development Server:** `npm run dev`
- **Lint Check:** `npm run lint`
- **Production Build:** `npm run build`
- **Firebase Rules Deploy (jika CLI terpasang):** `npx firebase deploy --only firestore:rules`

---

## 5. Project Structure & Architecture

```
d:/VSC Files/choral-inventory/
├── .env.local                     # Firebase config (tanpa koma trailing)
├── firestore.rules                # Source-controlled Firestore security rules
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/             # Halaman login mandiri (tanpa sidebar AppShell)
│   │   │       └── page.js
│   │   ├── persediaan/            # Halaman monitoring persediaan
│   │   │   └── page.js
│   │   └── layout.js              # Root layout with AuthProvider & AppShell guard
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx      # Form login dengan checkbox "Keep me signed in"
│   │   │   └── ProtectedRoute.jsx # Client wrapper untuk redirect unauthorized
│   │   ├── providers/
│   │   │   ├── AuthProvider.jsx   # Context state: user, loading, login, logout
│   │   │   └── AppProvider.jsx    # Theme & Lang context
│   │   └── views/
│   │       └── PersediaanView.jsx # Live table with onSnapshot subscription
│   └── lib/
│       ├── firebase/
│       │   ├── firebase-client.js # Inisialisasi Firebase App, Auth, Firestore
│       │   ├── auth-service.js    # signIn, signOut, setPersistence helpers
│       │   ├── inventory-service.js # addStock, updateStock, seedFromDummy
│       │   └── useRealtimeInventory.js # React hook wrapping onSnapshot
│       └── dummyData.js           # Existing dummy data for seed migration
```

---

## 6. Code Style & Key Patterns

### Pattern 1: Session Persistence Handling (`auth-service.js`)
```javascript
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signOut as fbSignOut
} from "firebase/auth";
import { auth } from "./firebase-client";

export async function loginUser(email, password, keepSignedIn = false) {
  // Pilih persistensi: LOCAL jika keepSignedIn dicentang, SESSION jika tidak
  const persistenceType = keepSignedIn 
    ? browserLocalPersistence 
    : browserSessionPersistence;
  
  await setPersistence(auth, persistenceType);
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return await fbSignOut(auth);
}
```

### Pattern 2: Realtime Firestore Hook (`useRealtimeInventory.js`)
```javascript
"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase-client";

export function useRealtimeInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("sku", "asc"));
    
    // onSnapshot automatically listens for real-time changes with zero latency
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { items, loading, error };
}
```

---

## 7. Boundaries (Three-Tier System)

- **Always Do:**
  - Validasi semua input form sebelum dikirim ke Firestore.
  - Tangani `loading` dan `error` state pada setiap hook realtime.
  - Unsubscribe listener `onSnapshot` saat komponen unmount untuk mencegah memory leak.
  - Batasi akses halaman dashboard/persediaan hanya untuk user yang terotentikasi.
- **Ask First:**
  - Mengubah skema field data `inventory` yang berpotensi memengaruhi view lain.
  - Menginstal library third-party baru di luar paket yang sudah ada.
- **Never Do:**
  - Mengunggah / meng-commit Service Account Key atau secret credentials ke repository.
  - Membiarkan rules Firestore terbuka ke publik (`allow read, write: if true;`).
  - Mengizinkan mutasi nilai stok langsung ke angka negatif.
  - Menggunakan `localStorage` manual untuk menyimpan token auth (gunakan session persistence bawaan Firebase).

---

## 8. Success Criteria (Testable Conditions)

1. **Autentikasi & Sesi:**
   - [ ] User berhasil login menggunakan email & password.
   - [ ] Jika checkbox *"Keep me signed in"* dicentang, sesi tetap aktif setelah tab/browser ditutup dan dibuka kembali.
   - [ ] Jika checkbox *"Keep me signed in"* tidak dicentang, sesi langsung terhapus saat browser/tab ditutup (`browserSessionPersistence`).
   - [ ] Tombol logout di header/sidebar berhasil mengeluarkan user dan mengarahkan kembali ke `/login`.
2. **Proteksi Unauthorized:**
   - [ ] Jika user belum login dan mencoba membuka `/persediaan` atau `/dashboard`, sistem langsung redirect ke `/login`.
   - [ ] Halaman login `/login` tampil bersih tanpa membungkus `AppShell` (sidebar/header aplikasi).
   - [ ] Akses langsung ke database tanpa token auth ditolak oleh Firestore Security Rules.
3. **Realtime Synchronization:**
   - [ ] Data koleksi `inventory` di Firestore berhasil dimigrasi/diseed dari `dummyData.js` dengan menyertakan field `barcode`.
   - [ ] Saat nilai stok diubah di Firebase Console atau via mutasi di satu tab, tab browser lain yang membuka `PersediaanView` langsung terupdate otomatis seketika tanpa refresh.
   - [ ] Badge status kesehatan stok (Aman / Menipis / Kritis) berubah secara reaktif mengikuti angka `availableStock` dan `minimumStock`.

---

## 9. Decided Specifications & Assumptions

1. **Seed & Batch Importer:** Layanan import/seed data inventaris dibuat modular (`importInventoryRecords(records)`). Data awal diambil dari `dummyData.js`, namun strukturnya siap dan langsung *replaceable* untuk menerima data hasil parsing file XLSX/CSV di masa depan. Tombol trigger disematkan di UI admin/settings.
2. **Path Login:** Halaman login diletakkan di `/login` dengan desain bersih tanpa sidebar `AppShell`, konsisten menggunakan tema gelap tactical CHORAL.ID.
3. **Admin SDK:** Dikonfirmasi tidak digunakan; murni menggunakan Firebase Client SDK.
