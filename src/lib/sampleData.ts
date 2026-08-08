import { JournalEntry } from '../types';
import { GeminiProcessResult } from './ai';

/**
 * Data contoh / demo yang digunakan saat belum ada catatan riil di Firestore.
 * Dikumpulkan di sini agar tidak diduplikasi di banyak komponen.
 */

export const SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 'sample-1',
    userId: 'demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content:
      'Tadi beli galon di warung sebelah, harganya 20rb. Cuaca lumayan panas tapi untung dapat es kelapa segar.',
    transcriptRaw:
      'Eee... tadi siang saya ke warung sebelah beli galon harganya dua puluh ribu...',
    hasAudio: true,
    mood: 'Senang',
    tags: ['Harian', 'Belanja'],
  },
  {
    id: 'sample-2',
    userId: 'demo',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    content:
      'Rapat pagi berjalan lancar. Tim sepakat memakai arsitektur PWA berbasis AI untuk kompetisi VibeCode 2026.',
    transcriptRaw: 'Rapat pagi tadi tim sepakat pakai arsitektur PWA...',
    hasAudio: false,
    mood: 'Fokus',
    tags: ['Kerja', 'Proyek'],
  },
];

export const DEMO_AI_RESULT: GeminiProcessResult = {
  transcriptRaw:
    'Eee... tadi siang saya ke warung sebelah beli galon harganya dua puluh ribu terus cuaca panas banget tapi untung dapat es kelapa segar...',
  summary:
    'Membeli galon seharga Rp20.000 di warung sebelah. Cuaca lumayan panas tetapi merasa segar setelah menikmati es kelapa.',
  mood: 'Senang',
  tags: ['Harian', 'Belanja'],
};

export const SAMPLE_SUGGESTIONS = [
  'Terakhir beli galon kapan dan berapa harganya?',
  'Apa saja hal menarik minggu ini?',
  'Bagaimana progres proyek VibeCode?',
];

export const PROMPT_STARTERS = [
  'Apa hal paling berkesan atau menyenangkan hari ini?',
  'Apakah ada ide baru, rapat, atau keputusan penting?',
  'Apa pembelian/pengeluaran kecil yang baru saja kamu lakukan?',
  'Bagaimana perasaanmu sekarang dan apa targetmu esok hari?',
];

export const SAMPLE_ENTRY_DETAIL: JournalEntry = {
  id: 'sample-1',
  userId: 'demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content:
    'Tadi beli galon di warung sebelah, harganya 20rb. Cuaca lumayan panas tapi untung dapat es kelapa segar.',
  transcriptRaw:
    'Eee... tadi siang saya ke warung sebelah beli galon harganya dua puluh ribu...',
  hasAudio: true,
  mood: 'Senang',
  tags: ['Harian', 'Belanja'],
};
