export type RecFrequency = '1x/hari' | '2x/hari' | 'tiap 2 hari' | 'tiap 3 hari';

export interface UserSettings {
  frequency: RecFrequency;
  reminderTime: string; // "HH:mm"
  privacyPin?: string;
  isFirstTime: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  content: string; // Hasil rangkuman atau catatan manual
  transcriptRaw?: string;
  hasAudio: boolean;
  audioStoragePath?: string | null;
  source?: 'voice' | 'manual';
  mood?: string | null;
  tags?: string[];
}

export interface UserStreak {
  currentStreak: number;
  bestStreak: number;
  lastJournalDate: string | null; // "YYYY-MM-DD"
  graceUsedThisWeek?: boolean;
}
