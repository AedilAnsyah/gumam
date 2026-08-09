/**
 * db.ts — Firestore CRUD Helper Functions
 *
 * Layer tipis di atas Firebase v12 Modular SDK untuk operasi umum Firestore.
 * Semua fungsi sudah diketik dengan TypeScript secara ketat.
 *
 * Konvensi:
 *   - Semua fungsi yang berinteraksi dengan network diberi try/catch.
 *   - Error selalu di-rethrow dengan pesan kontekstual agar mudah di-debug.
 *   - Tidak ada logic bisnis di sini — murni operasi data.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryConstraint,
  WriteBatch,
  writeBatch,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalEntry, UserSettings, UserStreak } from '../types';
import {
  FIRESTORE_COLLECTION_ENTRIES,
  FIRESTORE_COLLECTION_USERS,
  FIRESTORE_SUBCOLLECTION_SETTINGS,
  FIRESTORE_SUBCOLLECTION_STREAK,
  FIRESTORE_DOC_SETTINGS,
  FIRESTORE_DOC_STREAK,
} from './constants';

// ─── Type Helpers ─────────────────────────────────────────────────────────────

/** Konversi Firestore document snapshot ke JournalEntry */
function snapshotToEntry(snap: QueryDocumentSnapshot | DocumentSnapshot): JournalEntry {
  return { id: snap.id, ...snap.data() } as JournalEntry;
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

/**
 * Simpan entri jurnal baru ke Firestore.
 *
 * @param data - Partial JournalEntry tanpa `id` (di-generate Firestore).
 * @returns string - ID dokumen yang baru dibuat.
 */
export async function createEntry(
  data: Omit<JournalEntry, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(
      collection(db, FIRESTORE_COLLECTION_ENTRIES),
      {
        ...data,
        serverCreatedAt: serverTimestamp(), // timestamp server untuk ordering akurat
      }
    );
    return docRef.id;
  } catch (err) {
    throw new Error(`[db] Gagal menyimpan entri: ${(err as Error).message}`);
  }
}

/**
 * Ambil satu entri jurnal berdasarkan ID dokumen.
 *
 * @param entryId - ID dokumen Firestore.
 * @returns JournalEntry | null
 */
export async function getEntryById(entryId: string): Promise<JournalEntry | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTION_ENTRIES, entryId));
    return snap.exists() ? snapshotToEntry(snap) : null;
  } catch (err) {
    throw new Error(`[db] Gagal mengambil entri ${entryId}: ${(err as Error).message}`);
  }
}

/**
 * Ambil semua entri jurnal milik user, diurutkan dari terbaru.
 *
 * @param userId  - Firebase Auth uid.
 * @param maxItems - Batas jumlah dokumen (default: 200 untuk AI Tanya Jurnal).
 * @returns JournalEntry[]
 */
export async function getEntriesByUser(
  userId: string,
  maxItems: number = 200
): Promise<JournalEntry[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    ];

    const snap = await getDocs(
      query(collection(db, FIRESTORE_COLLECTION_ENTRIES), ...constraints)
    );

    return snap.docs.map(snapshotToEntry);
  } catch (err) {
    throw new Error(`[db] Gagal mengambil daftar entri: ${(err as Error).message}`);
  }
}

/**
 * Ambil entri jurnal dengan pagination (untuk list view yang bisa di-scroll).
 *
 * @param userId         - Firebase Auth uid.
 * @param pageSize       - Jumlah item per halaman.
 * @param lastDocument   - Dokumen terakhir dari halaman sebelumnya (untuk cursor).
 * @returns { entries, lastDoc } - Entri + cursor untuk halaman berikutnya.
 */
export async function getEntriesPaginated(
  userId: string,
  pageSize: number = 20,
  lastDocument?: QueryDocumentSnapshot
): Promise<{ entries: JournalEntry[]; lastDoc: QueryDocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    ];

    if (lastDocument) {
      constraints.push(startAfter(lastDocument));
    }

    const snap = await getDocs(
      query(collection(db, FIRESTORE_COLLECTION_ENTRIES), ...constraints)
    );

    const entries = snap.docs.map(snapshotToEntry);
    const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { entries, lastDoc };
  } catch (err) {
    throw new Error(`[db] Gagal mengambil entri paginated: ${(err as Error).message}`);
  }
}

/**
 * Update isi catatan jurnal yang sudah ada.
 * Hanya mengupdate field yang diberikan (partial update).
 *
 * @param entryId - ID dokumen Firestore.
 * @param updates - Field yang ingin diubah.
 */
export async function updateEntry(
  entryId: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, FIRESTORE_COLLECTION_ENTRIES, entryId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    throw new Error(`[db] Gagal mengupdate entri ${entryId}: ${(err as Error).message}`);
  }
}

/**
 * Hapus satu entri jurnal dari Firestore.
 *
 * Audio tidak pernah disimpan ke Storage, jadi hanya dokumen Firestore
 * yang perlu dihapus.
 *
 * @param entry - JournalEntry yang akan dihapus.
 */
export async function deleteEntry(entry: JournalEntry): Promise<void> {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTION_ENTRIES, entry.id));
  } catch (err) {
    throw new Error(`[db] Gagal menghapus entri ${entry.id}: ${(err as Error).message}`);
  }
}

/**
 * Hapus SEMUA entri milik satu user (untuk fitur "Hapus Semua Data Saya").
 * Menggunakan WriteBatch untuk efisiensi dan atomicity.
 *
 * @param userId - Firebase Auth uid.
 */
export async function deleteAllUserEntries(userId: string): Promise<void> {
  try {
    const snap = await getDocs(
      query(
        collection(db, FIRESTORE_COLLECTION_ENTRIES),
        where('userId', '==', userId)
      )
    );

    if (snap.empty) return;

    // Firestore batch max 500 ops, chunk jika perlu
    const BATCH_LIMIT = 500;
    const docs = snap.docs;

    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const batch: WriteBatch = writeBatch(db);
      docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    throw new Error(`[db] Gagal menghapus semua entri user: ${(err as Error).message}`);
  }
}

// ─── User Settings ────────────────────────────────────────────────────────────

/** Referensi dokumen settings untuk user tertentu */
function settingsRef(userId: string): DocumentReference {
  return doc(
    db,
    FIRESTORE_COLLECTION_USERS, userId,
    FIRESTORE_SUBCOLLECTION_SETTINGS, FIRESTORE_DOC_SETTINGS
  );
}

/**
 * Simpan atau update settings user ke Firestore.
 *
 * @param userId   - Firebase Auth uid.
 * @param settings - Objek settings yang ingin disimpan (partial aman).
 */
export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  try {
    await setDoc(
      settingsRef(userId),
      { ...settings, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    throw new Error(`[db] Gagal menyimpan settings: ${(err as Error).message}`);
  }
}

/**
 * Ambil settings user dari Firestore.
 *
 * @param userId - Firebase Auth uid.
 * @returns UserSettings | null
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const snap = await getDoc(settingsRef(userId));
    return snap.exists() ? (snap.data() as UserSettings) : null;
  } catch (err) {
    throw new Error(`[db] Gagal mengambil settings: ${(err as Error).message}`);
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/** Referensi dokumen streak untuk user tertentu */
function streakRef(userId: string): DocumentReference {
  return doc(
    db,
    FIRESTORE_COLLECTION_USERS, userId,
    FIRESTORE_SUBCOLLECTION_STREAK, FIRESTORE_DOC_STREAK
  );
}

/**
 * Ambil data streak user dari Firestore.
 *
 * @param userId - Firebase Auth uid.
 * @returns UserStreak | null
 */
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  try {
    const snap = await getDoc(streakRef(userId));
    return snap.exists() ? (snap.data() as UserStreak) : null;
  } catch (err) {
    throw new Error(`[db] Gagal mengambil streak: ${(err as Error).message}`);
  }
}

/**
 * Tulis data streak user ke Firestore.
 *
 * @param userId - Firebase Auth uid.
 * @param streak - Objek UserStreak yang akan disimpan.
 */
export async function saveUserStreak(
  userId: string,
  streak: UserStreak
): Promise<void> {
  try {
    await setDoc(
      streakRef(userId),
      { ...streak, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    throw new Error(`[db] Gagal menyimpan streak: ${(err as Error).message}`);
  }
}
