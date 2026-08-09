import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { JournalEntry, UserStreak } from '../types';
import {
  FIRESTORE_COLLECTION_ENTRIES,
  FIRESTORE_COLLECTION_USERS,
  FIRESTORE_SUBCOLLECTION_STREAK,
  FIRESTORE_DOC_STREAK,
  MS_PER_DAY,
  STREAK_INITIAL_COUNT,
} from './constants';

/**
 * Simpan catatan jurnal baru ke Firestore.
 *
 * Audio TIDAK disimpan ke Firebase Storage — blob hanya dikirim ke Gemini API
 * untuk transkripsi, lalu dibuang dari memori. Hanya teks hasil AI dan
 * metadata yang dipersistensikan ke Firestore.
 */
export async function saveJournalEntry(params: {
  content: string;
  transcriptRaw?: string;
  source: 'voice' | 'manual';
  mood?: string | null;
  tags?: string[];
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User belum terotentikasi. Silakan refresh aplikasi.');
  }

  const userId = user.uid;
  const nowIso = new Date().toISOString();

  const entryData = {
    userId,
    createdAt: nowIso,
    updatedAt: nowIso,
    content: params.content,
    transcriptRaw: params.transcriptRaw || '',
    // hasAudio selalu false — audio tidak disimpan, hanya diproses Gemini lalu dibuang
    hasAudio: false,
    audioStoragePath: null,
    source: params.source,
    mood: params.mood || null,
    tags: params.tags || [],
    serverCreatedAt: serverTimestamp(),
  };

  const entriesRef = collection(db, FIRESTORE_COLLECTION_ENTRIES);
  const docRef = await addDoc(entriesRef, entryData);
  const entryId = docRef.id;

  // Update Streak dengan dukungan Grace Day
  await updateUserStreak(userId);

  return entryId;
}

/**
 * Update atau inisialisasi streak pengguna (termasuk logika Grace Day 1x/minggu)
 */
export async function updateUserStreak(userId: string): Promise<UserStreak> {
  const streakRef = doc(db, FIRESTORE_COLLECTION_USERS, userId, FIRESTORE_SUBCOLLECTION_STREAK, FIRESTORE_DOC_STREAK);
  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  let streakData: UserStreak = {
    currentStreak: STREAK_INITIAL_COUNT,
    bestStreak: STREAK_INITIAL_COUNT,
    lastJournalDate: todayStr,
    graceUsedThisWeek: false,
  };

  try {
    const snap = await getDoc(streakRef);
    if (snap.exists()) {
      const existing = snap.data() as UserStreak;
      const lastDate = existing.lastJournalDate;
      const graceUsed = existing.graceUsedThisWeek || false;

      if (lastDate === todayStr) {
        // Sudah mencatat hari ini
        streakData = existing;
      } else if (lastDate) {
        const lastDateTime = new Date(lastDate).getTime();
        const todayTime = new Date(todayStr).getTime();
        const diffDays = Math.round((todayTime - lastDateTime) / MS_PER_DAY);

        if (diffDays === 1) {
          // Mencatat berturut-turut
          const newCurrent = (existing.currentStreak || 0) + 1;
          streakData = {
            currentStreak: newCurrent,
            bestStreak: Math.max(existing.bestStreak || 1, newCurrent),
            lastJournalDate: todayStr,
            graceUsedThisWeek: graceUsed,
          };
        } else if (diffDays === 2 && !graceUsed) {
          // Bolong 1 hari tetapi Grace Day tersedia! Pertahankan streak
          const newCurrent = (existing.currentStreak || 0) + 1;
          streakData = {
            currentStreak: newCurrent,
            bestStreak: Math.max(existing.bestStreak || 1, newCurrent),
            lastJournalDate: todayStr,
            graceUsedThisWeek: true, // Pakai izin bolong minggu ini
          };
        } else {
          // Bolong >1 hari atau grace sudah terpakai -> reset ke 1
          streakData = {
            currentStreak: STREAK_INITIAL_COUNT,
            bestStreak: Math.max(existing.bestStreak || STREAK_INITIAL_COUNT, STREAK_INITIAL_COUNT),
            lastJournalDate: todayStr,
            graceUsedThisWeek: false,
          };
        }
      }
    }

    await setDoc(streakRef, {
      ...streakData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

  } catch (err) {
    console.warn('Gagal meng-update streak ke Firestore:', err);
  }

  return streakData;
}

/**
 * Ambil daftar catatan jurnal milik user yang sedang login
 */
export async function getUserEntries(userId: string): Promise<JournalEntry[]> {
  try {
    const q = query(
      collection(db, FIRESTORE_COLLECTION_ENTRIES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as JournalEntry[];
  } catch (err) {
    console.error('Error fetching user entries:', err);
    return [];
  }
}
