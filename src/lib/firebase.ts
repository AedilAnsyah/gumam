import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  setDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Configuration (Ganti dengan config riil dari Firebase Console)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gumam-pwa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gumam-pwa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gumam-pwa.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore dengan Offline Persistence bawaan
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Storage
export const storage = getStorage(app);

/**
 * Otomatis lakukan Anonymous Auth jika belum ada user
 */
export function initAnonymousAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        unsubscribe();
        resolve(currentUser);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (error) {
          console.error("Firebase Anonymous Auth Error:", error);
          reject(error);
        }
      }
    });
  });
}

/**
 * Migrasikan settings dari localStorage ke Firestore (users/{userId}/settings/preferences)
 */
export async function syncLocalSettingsToFirestore(userId: string) {
  const localSettingsStr = localStorage.getItem('gumam_settings');
  if (localSettingsStr) {
    try {
      const localSettings = JSON.parse(localSettingsStr);
      const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
      await setDoc(settingsRef, {
        ...localSettings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Gagal migrasi settings ke Firestore:", err);
    }
  }
}
