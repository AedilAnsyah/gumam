import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { UserStreak } from '../types';
import {
  FIRESTORE_COLLECTION_USERS,
  FIRESTORE_SUBCOLLECTION_STREAK,
  FIRESTORE_DOC_STREAK,
} from './constants';

export function useStreak() {
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastJournalDate: null,
    graceUsedThisWeek: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
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

      unsubscribeSnapshot = onSnapshot(
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
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return { streak, loading };
}
