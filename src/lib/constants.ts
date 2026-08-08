/**
 * Konstanta Aplikasi Terpusat (Single Source of Truth)
 * Semua nilai yang sebelumnya hardcoded dikumpulkan di sini agar mudah dikelola.
 */

// ─── Identitas Aplikasi ───────────────────────────────────────────────────────
export const APP_NAME = 'Gumam';
export const APP_TAGLINE = 'Voice Journaling AI';
export const APP_VERSION = '1.0.0';
export const APP_FULL_NAME = 'Gumam PWA Voice Journaling';
export const TEAM_NAME = 'Tim Calon Manajer Kopdes';
export const COMPETITION_NAME = 'BitsMikro Innovative VibeCode 2026';

// ─── LocalStorage Keys ───────────────────────────────────────────────────────
export const LS_KEY_SETTINGS = 'gumam_settings';
export const LS_KEY_ONBOARDED = 'gumam_onboarded';

// ─── Firestore Collection / Document Paths ────────────────────────────────────
export const FIRESTORE_COLLECTION_ENTRIES = 'entries';
export const FIRESTORE_COLLECTION_USERS = 'users';
export const FIRESTORE_DOC_STREAK = 'current';
export const FIRESTORE_DOC_SETTINGS = 'preferences';
export const FIRESTORE_SUBCOLLECTION_STREAK = 'streak';
export const FIRESTORE_SUBCOLLECTION_SETTINGS = 'settings';

// ─── Firebase Storage Paths ──────────────────────────────────────────────────
export const STORAGE_AUDIO_PREFIX = 'audio';

// ─── Gemini API ──────────────────────────────────────────────────────────────
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── PWA & Notifikasi ────────────────────────────────────────────────────────
export const NOTIFICATION_ICON = '/masked-icon.svg';
export const NOTIFICATION_TAG_TEST = 'gumam-reminder-test';
export const NOTIFICATION_TAG_DAILY = 'gumam-daily-reminder';
export const NOTIFICATION_TITLE = 'Waktunya Mencatat Harimu ✍️';
export const NOTIFICATION_BODY_TEST = 'Bicarakan harimu di Gumam secara alami & pertahankan streak jurnalmu!';
export const NOTIFICATION_BODY_DAILY = 'Saatnya merekam cerita harimu dan menjaga streak jurnal tetap berjalan!';

// ─── Default Settings ────────────────────────────────────────────────────────
export const DEFAULT_REMINDER_TIME = '20:00';
export const DEFAULT_FREQUENCY = '1x/hari';

// ─── Streak ──────────────────────────────────────────────────────────────────
export const STREAK_GRACE_DAYS_PER_WEEK = 1;
export const STREAK_INITIAL_COUNT = 1;
export const MS_PER_DAY = 1000 * 3600 * 24;

// ─── Export / Backup ─────────────────────────────────────────────────────────
export const EXPORT_FILE_PREFIX = 'gumam_backup';

// ─── Routing ─────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  ENTRIES: '/entries',
  ENTRY_DETAIL: '/entries/:id',
  TANYA: '/tanya',
  SETTINGS: '/settings',
  ONBOARDING: '/onboarding',
} as const;

// ─── Desktop Header Titles (mapped to route) ─────────────────────────────────
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Studio Rekaman Voice Journal',
  [ROUTES.ENTRIES]: 'Daftar Catatan & Kalender',
  [ROUTES.TANYA]: 'Tanya AI (Natural Language Search)',
  [ROUTES.SETTINGS]: 'Setelan Aplikasi',
};
