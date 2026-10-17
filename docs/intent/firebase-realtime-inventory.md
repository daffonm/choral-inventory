 # Outcome 
 Setup backend Firebase Client SDK (Cloud Firestore & Auth) dengan fleksibilitas sesi login ("Keep me signed in" vs session-only), proteksi data unauthorized via Firestore Security Rules, serta listener realtime (onSnapshot) untuk sinkronisasi persediaan barang di web.

# User
1–4 orang (Kepala Gudang di PC utama, dan Staf operasional di PC/HP scanner).
Why now: Membutuhkan sinkronisasi stok realtime di PC dengan fondasi sesi dan autentikasi yang aman untuk integrasi scan kamera HP nanti.

# Success
# Autentikasi & Sesi
Login mendukung checkbox "Keep me signed in" (browserLocalPersistence vs browserSessionPersistence). Akun 1–4 staf dikelola dari Firebase Console.

# Keamanan
Rute web diproteksi dari unauthorized; Firestore Security Rules memblokir semua akses baca/tulis dari pihak yang belum login.
Realtime Sync: Data persediaan barang dan mutasi terupdate otomatis seketika di layar via listener Firestore onSnapshot.

# Data Structure 
Skema Firestore menyertakan field kode/barcode barang agar siap diintegrasikan dengan scanner HP di fase selanjutnya.

# Constraint
100% Bebas Biaya & Tanpa Kartu Kredit (Firebase Spark Free-Tier), hanya menggunakan Client SDK tanpa backend/Admin SDK yang berlebihan.
Out of scope: Fitur kamera scan barcode di HP (fase selanjutnya); Firebase Admin SDK & Cloud Functions; notifikasi eksternal.