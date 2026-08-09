/**
 * crypto.ts — Utility Keamanan Lokal
 *
 * ─── Keputusan Arsitektur (baca sebelum mengubah) ────────────────────────────
 *
 * MENGAPA client-side encryption TIDAK DIPAKAI sebagai mekanisme utama di MVP:
 *
 * 1. Keamanan antar-user SUDAH ditangani di level server (Firestore Security Rules).
 *    Enkripsi client-side hanya berguna untuk melindungi data dari admin Firebase
 *    sendiri — bukan requirement yang diminta.
 *
 * 2. Kalau konten dienkripsi sebelum masuk Firestore, fitur "AI Tanya Jurnal"
 *    TIDAK BISA berjalan — Gemini API tidak bisa membaca ciphertext.
 *
 * 3. Manajemen kunci di browser (Web Crypto) sangat kompleks: kunci hilang jika
 *    cache browser dibersihkan → data tidak bisa dibuka lagi.
 *
 * YANG DIIMPLEMENTASIKAN DI SINI:
 *   - Hash PIN 6-digit yang aman (SHA-256 via Web Crypto API) untuk fitur
 *     "App Lock" / layar kunci di device — sebatas UX protection, bukan
 *     enkripsi data di storage.
 *   - Fungsi compare PIN untuk proses verifikasi login lokal.
 *
 * Kalau enkripsi penuh dibutuhkan pasca-lomba, pertimbangkan:
 *   - Mengenkripsi hanya field `content` dan `transcriptRaw`.
 *   - Menyimpan kunci enkripsi terenkripsi di subcollection user Firestore
 *     (bukan localStorage yang bisa dibersihkan).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── PIN Hashing (Web Crypto API) ─────────────────────────────────────────────
//
// Tidak memakai btoa() (base64 encoding biasa) karena itu BUKAN hashing —
// btoa("123456") bisa di-decode balik secara trivial.
// SHA-256 via Web Crypto API adalah standar minimum yang benar.

/**
 * Hash PIN 6-digit menggunakan SHA-256 via native Web Crypto API.
 * Mengembalikan string hex (64 karakter).
 *
 * @param pin - PIN dalam format string, misal "123456".
 * @returns Promise<string> - Hash SHA-256 dalam format hex lowercase.
 *
 * @example
 * const hashed = await hashPin("123456");
 * // → "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifikasi PIN yang dimasukkan user dengan hash yang tersimpan.
 * Aman terhadap timing attacks karena perbandingan dilakukan di level hash,
 * bukan string asli.
 *
 * @param inputPin   - PIN yang baru dimasukkan user.
 * @param storedHash - Hash SHA-256 yang tersimpan di localStorage/Firestore.
 * @returns Promise<boolean> - true jika PIN cocok.
 */
export async function verifyPin(inputPin: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPin(inputPin);
  return inputHash === storedHash;
}

// ─── Secure Random Helpers ────────────────────────────────────────────────────

/**
 * Generate token acak yang aman secara kriptografis.
 * Berguna untuk membuat session ID lokal atau token CSRF sederhana.
 *
 * @param byteLength - Panjang byte (default 16 = 128-bit, output 32 hex chars).
 * @returns string - Hex string acak.
 */
export function generateSecureToken(byteLength: number = 16): string {
  const array = new Uint8Array(byteLength);
  window.crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Storage Security Helpers ─────────────────────────────────────────────────

const PIN_HASH_KEY = 'gumam_pin_hash';
const APP_LOCK_KEY = 'gumam_app_locked';

/**
 * Simpan hash PIN ke localStorage.
 * Note: localStorage tidak dienkripsi oleh browser secara default.
 * Ini cukup untuk UX app-lock, bukan untuk keamanan data sensitif.
 *
 * @param pin - PIN asli yang akan di-hash sebelum disimpan.
 */
export async function savePinHash(pin: string): Promise<void> {
  const hashed = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hashed);
}

/**
 * Ambil hash PIN yang tersimpan dari localStorage.
 * @returns string | null
 */
export function getStoredPinHash(): string | null {
  return localStorage.getItem(PIN_HASH_KEY);
}

/**
 * Hapus PIN dari localStorage (untuk fitur "Nonaktifkan App Lock").
 */
export function removePinHash(): void {
  localStorage.removeItem(PIN_HASH_KEY);
}

/**
 * Cek apakah PIN sudah diset oleh user.
 * @returns boolean
 */
export function hasPinSet(): boolean {
  return localStorage.getItem(PIN_HASH_KEY) !== null;
}

/**
 * Set status app-lock (dikunci/tidak dikunci) di sessionStorage.
 * Menggunakan sessionStorage agar lock otomatis reset saat browser/tab ditutup.
 *
 * @param locked - true untuk mengunci, false untuk membuka.
 */
export function setAppLocked(locked: boolean): void {
  sessionStorage.setItem(APP_LOCK_KEY, locked ? '1' : '0');
}

/**
 * Cek apakah app sedang dalam keadaan terkunci.
 * Default terkunci jika PIN diset tapi sessionStorage belum punya nilainya.
 *
 * @returns boolean
 */
export function isAppLocked(): boolean {
  if (!hasPinSet()) return false; // Tidak ada PIN = tidak perlu kunci
  const val = sessionStorage.getItem(APP_LOCK_KEY);
  return val !== '0'; // Dianggap terkunci jika null (fresh session) atau '1'
}
