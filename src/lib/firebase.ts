/**
 * firebase.ts — Inisialisasi Firebase SDK (Auth, Firestore, Storage)
 *
 * Semua konfigurasi dibaca dari environment variables Vite (VITE_*).
 * Jika ada variabel yang kosong saat runtime, akan langsung throw error
 * yang informatif agar debugging lebih cepat di tahap development.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import {
  LS_KEY_SETTINGS,
  FIRESTORE_COLLECTION_USERS,
  FIRESTORE_SUBCOLLECTION_SETTINGS,
  FIRESTORE_DOC_SETTINGS,
} from './constants';

// ─── Validasi Environment Variables ──────────────────────────────────────────

/**
 * Validasi keberadaan semua env vars Firebase yang wajib.
 * Melempar error deskriptif jika ada yang kosong.
 */
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `[Gumam] Environment variable "${key}" tidak ditemukan atau kosong.\n` +
      `Pastikan kamu sudah menyalin .env.example ke .env dan mengisi semua nilainya.`
    );
  }
  return value.trim();
}

const firebaseConfig = {
  apiKey:            getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain:        getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId:         getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket:     getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId:             getRequiredEnv('VITE_FIREBASE_APP_ID'),
};

// ─── Inisialisasi Firebase App (singleton safe) ───────────────────────────────

const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ─── Firebase Auth ────────────────────────────────────────────────────────────

export const auth: Auth = getAuth(app);

// ─── Firestore (dengan Offline Persistence bawaan) ───────────────────────────
//
// `persistentLocalCache` + `persistentMultipleTabManager` memungkinkan:
//   1. Aplikasi tetap bisa membaca catatan yang sudah di-cache saat offline.
//   2. Sinkronisasi otomatis kembali ke server saat online.
//   3. Multi-tab aman: tidak ada konflik data antar-tab browser.

export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ─── Firebase Storage ────────────────────────────────────────────────────────
// Storage dinonaktifkan sementara — billing Firebase Storage belum diaktifkan.
// Semua audio hanya dikirim ke Gemini API untuk transkripsi, lalu dibuang.
// Uncomment baris di bawah untuk mengaktifkan kembali Storage:
// import { getStorage, FirebaseStorage } from 'firebase/storage';
// export const storage: FirebaseStorage = getStorage(app);
// ─── Anonymous Auth Helper ────────────────────────────────────────────────────

/**
 * Inisialisasi Anonymous Auth secara otomatis.
 *
 * - Jika user sudah ada (dari sesi sebelumnya), langsung resolve.
 * - Jika belum ada, lakukan signInAnonymously() untuk mendapatkan uid unik.
 *
 * @returns Promise<User> — Firebase User dengan uid yang stabil.
 */
export function initAnonymousAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribe();

      if (currentUser) {
        resolve(currentUser);
        return;
      }

      try {
        const credential = await signInAnonymously(auth);
        resolve(credential.user);
      } catch (error) {
        console.error('[Firebase] Anonymous Auth gagal:', error);
        reject(
          new Error(
            'Gagal membuat sesi pengguna. Periksa koneksi internet dan pastikan ' +
            'Anonymous Auth sudah diaktifkan di Firebase Console → Authentication → Sign-in method.'
          )
        );
      }
    });
  });
}

// ─── Settings Sync Helper ────────────────────────────────────────────────────

/**
 * Migrasi settings dari localStorage ke Firestore.
 *
 * Dipanggil sekali setelah user berhasil auth — memastikan preferensi user
 * tersinkron ke cloud untuk kebutuhan multi-device di masa depan.
 *
 * @param userId - uid dari Firebase Auth.
 */
export async function syncLocalSettingsToFirestore(userId: string): Promise<void> {
  const raw = localStorage.getItem(LS_KEY_SETTINGS);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const settingsRef = doc(
      db,
      FIRESTORE_COLLECTION_USERS,
      userId,
      FIRESTORE_SUBCOLLECTION_SETTINGS,
      FIRESTORE_DOC_SETTINGS
    );

    await setDoc(
      settingsRef,
      { ...parsed, syncedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    // Non-fatal: gagal sync tidak menghentikan app
    console.warn('[Firebase] Gagal sync settings ke Firestore:', err);
  }
}
