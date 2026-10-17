import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../firebase/firebase-client";

/**
 * Login user dengan opsi persistensi adaptif:
 * - keepSignedIn = true: browserLocalPersistence (tetap login meski tab/browser ditutup)
 * - keepSignedIn = false: browserSessionPersistence (otomatis logout saat tab/browser ditutup)
 */
export async function loginUser(email, password, keepSignedIn = false) {
  try {
    const persistence = keepSignedIn
      ? browserLocalPersistence
      : browserSessionPersistence;

    // Set persistensi sesi sebelum sign-in
    await setPersistence(auth, persistence);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (signInErr) {
      if (
        signInErr.code === "auth/user-not-found" ||
        signInErr.code === "auth/invalid-credential"
      ) {
        // Coba otomatis registrasi untuk inisialisasi akun jika belum terdaftar di Firebase
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          return {
            success: true,
            user: newCred.user,
          };
        } catch {
          throw signInErr;
        }
      }
      throw signInErr;
    }
  } catch (error) {
    console.error("Firebase Login Error:", error);
    return {
      success: false,
      error: formatAuthError(error),
    };
  }
}

/**
 * Logout pengguna saat ini
 */
export async function logoutUser() {
  try {
    await fbSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe ke perubahan status autentikasi
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Format pesan error Firebase Auth menjadi pesan ramah pengguna
 */
export function formatAuthError(error) {
  if (!error) return "Terjadi kesalahan saat autentikasi.";
  
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau kata sandi yang kamu masukkan salah.";
    case "auth/invalid-email":
      return "Format alamat email tidak valid.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan login yang gagal. Silakan coba lagi beberapa saat lagi demi keamanan.";
    case "auth/network-request-failed":
      return "Koneksi internet bermasalah. Periksa jaringan kamu.";
    case "auth/user-disabled":
      return "Akun ini telah dinonaktifkan oleh administrator.";
    default:
      return error.message || "Gagal masuk ke sistem. Silakan periksa kembali akun kamu.";
  }
}
