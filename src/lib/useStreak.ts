import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserStreak } from '../types';
import {
  FIRESTORE_COLLECTION_USERS,
  FIRESTORE_SUBCOLLECTION_STREAK,
  FIRESTORE_DOC_STREAK,
} from './constants';

/**
 * Hook untuk subscribe ke data streak real-time dari Firestore.
 * Mengembalikan objek UserStreak dan status loading.
 */
export function useStreak() {
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastJournalDate: null,
    graceUsedThisWeek: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const streakRef = doc(
      db,
      FIRESTORE_COLLECTION_USERS,
      user.uid,
      FIRESTORE_SUBCOLLECTION_STREAK,
      FIRESTORE_DOC_STREAK
    );

    const unsubscribe = onSnapshot(
      streakRef,
      (snap) => {
        if (snap.exists()) {
          setStreak(snap.data() as UserStreak);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Error listening to streak:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { streak, loading };
}
