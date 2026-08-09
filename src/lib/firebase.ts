/**
 * firebase.ts — Inisialisasi Firebase SDK (Auth, Firestore, Storage)
 *
 * Semua konfigurasi dibaca dari environment variables Vite (VITE_*).
 * Jika ada variabel yang belum diset, menggunakan fallback aman agar aplikasi
 * tetap dapat dibuka di browser tanpa crash / white-screen.
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

// ─── Validasi & Fallback Environment Variables ──────────────────────────────

function getEnv(key: string, fallback: string = ''): string {
  const value = import.meta.env[key];
  if (!value || value.trim() === '' || value.includes('your_')) {
    return fallback;
  }
  return value.trim();
}

const firebaseConfig = {
  apiKey:            getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyMockKeyForOfflineGumamDev12345'),
  authDomain:        getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'gumam-pwa.firebaseapp.com'),
  projectId:         getEnv('VITE_FIREBASE_PROJECT_ID', 'gumam-pwa'),
  storageBucket:     getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'gumam-pwa.appspot.com'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '1234567890'),
  appId:             getEnv('VITE_FIREBASE_APP_ID', '1:1234567890:web:abcdef123456'),
};

// ─── Inisialisasi Firebase App (singleton safe) ───────────────────────────────

const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ─── Firebase Auth ────────────────────────────────────────────────────────────

export const auth: Auth = getAuth(app);

// ─── Firestore (dengan Offline Persistence bawaan) ───────────────────────────

export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ─── Anonymous Auth Helper ────────────────────────────────────────────────────

export function initAnonymousAuth(): Promise<User> {
  return new Promise((resolve) => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        unsubscribe();

        if (currentUser) {
          resolve(currentUser);
          return;
        }

        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('[Gumam] Firebase Auth offline/mock fallback mode:', err);
          // Fallback dummy user object for local offline mode if network is blocked
          resolve({
            uid: 'local-anonymous-user',
            isAnonymous: true,
          } as User);
        }
      });
    } catch (err) {
      console.warn('[Gumam] Auth state listener fallback:', err);
      resolve({
        uid: 'local-anonymous-user',
        isAnonymous: true,
      } as User);
    }
  });
}

// ─── Firestore Sync Helper ────────────────────────────────────────────────────

export async function syncLocalSettingsToFirestore(uid: string): Promise<void> {
  if (!uid || uid === 'local-anonymous-user') return;
  try {
    const raw = localStorage.getItem(LS_KEY_SETTINGS);
    if (!raw) return;

    const settings = JSON.parse(raw);
    const settingsDocRef = doc(
      db,
      FIRESTORE_COLLECTION_USERS,
      uid,
      FIRESTORE_SUBCOLLECTION_SETTINGS,
      FIRESTORE_DOC_SETTINGS
    );

    await setDoc(settingsDocRef, {
      ...settings,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Gumam] Gagal sinkronisasi settings ke Firestore (offline mode):', err);
  }
}
