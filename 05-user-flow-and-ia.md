# 05 — User Flow & Information Architecture

## Information Architecture (peta halaman)

```
Runut (PWA)
├── (Auto, tanpa layar) Anonymous sign-in saat app pertama dibuka
│
├── Onboarding (hanya muncul sekali, first launch)
│   ├── 1. Pilih frekuensi mencatat
│   └── 2. Atur jam reminder
│
├── Home / Rekam  (tab utama, default landing)
│   ├── Tombol rekam
│   ├── Streak indicator
│   └── Link ke "tulis manual"
│
├── Alur Setelah Rekam (bukan halaman terpisah, tapi flow/modal)
│   ├── Processing (AI transkripsi + rangkuman)
│   ├── Review & Edit hasil AI
│   ├── Pilih mood/tag (stretch)
│   ├── Konfirmasi simpan audio: Ya / Tidak
│   └── Simpan → kembali ke Home dengan konfirmasi singkat
│
├── Catatan (tab)
│   ├── Toggle: List view / Calendar view
│   ├── Search bar (kata kunci)
│   └── Detail Catatan (buka 1 entry)
│       ├── Teks (editable)
│       ├── Audio player (kalau ada)
│       └── Tombol: Edit / Hapus
│
├── Tanya (tab, stretch feature — AI Tanya Jurnal)
│   ├── Chat-like input pertanyaan
│   └── Jawaban AI + referensi catatan sumber (klik → Detail Catatan)
│
└── Settings
    ├── Ubah frekuensi & jam reminder
    ├── Link akun ke email/Google (stretch, untuk multi-device)
    ├── Export/backup data (stretch)
    ├── Tema (stretch)
    └── Tentang / versi app
```

## Flow 1 — First-time Onboarding

```
Buka app pertama kali
        │
        ▼
(Background, tanpa UI) Firebase anonymous sign-in — user dapat uid unik
        │
        ▼
Layar sambutan singkat (1 kalimat value prop, bukan wall of text)
        │
        ▼
"Seberapa sering kamu mau mencatat?"
  [1x sehari] [2x sehari] [tiap 2 hari] [tiap 3 hari]
        │
        ▼
"Jam berapa mau diingatkan?"
  [Time picker]  +  tombol "Izinkan notifikasi" (browser permission prompt)
        │
        ▼
Masuk ke Home (Rekam)
```

## Flow 2 — Merekam Catatan (flow inti/paling sering dipakai)

```
Home
  │
  ▼ tap tombol rekam
Browser minta izin mic (hanya first time)
  │
  ▼
State: Recording
  - waveform bergerak real-time
  - timer durasi
  - tombol besar berubah jadi "berhenti"
  - kalau diam >5 detik (stretch): muncul prompt starter halus
  │
  ▼ tap berhenti
State: Processing
  - "AI sedang merapikan catatanmu..."
  - transkripsi (Whisper/Web Speech) → rangkuman (model kecil)
  │
  ▼
State: Review
  - tampilkan hasil rangkuman dalam textarea yang bisa diedit langsung
  - tombol kecil "lihat transkrip asli" (collapsible, untuk cek AI tidak salah rangkum)
  - (stretch) chip mood & tag yang diusulkan AI, bisa diubah
  │
  ▼ tap "Simpan"
Modal: "Simpan juga rekaman suara aslinya?"
  [Ya, simpan audio]   [Tidak, teks saja]
  │
  ▼
Enkripsi & simpan ke IndexedDB
  │
  ▼
Kembali ke Home, streak ter-update dengan micro-animation singkat
```

## Flow 3 — Alternatif Ketik Manual

```
Home → tap "tulis manual sebagai gantinya"
  │
  ▼
Textarea kosong langsung fokus (tanpa AI processing, karena tidak ada suara untuk ditranskrip)
  │
  ▼ tap "Simpan"
Simpan langsung (skip modal audio karena memang tidak ada audio)
  │
  ▼
Kembali ke Home
```

> Catatan penting: catatan hasil ketik manual tetap dihitung untuk streak — treat sama seperti catatan hasil suara. Ini menghindari user merasa "dipaksa" pakai suara padahal app tetap menghargai kedua cara.

## Flow 4 — Mencari Catatan Lama (kata kunci)

```
Tab Catatan → tap search bar
  │
  ▼
Ketik keyword, misal "beli galon"
  │
  ▼
List ter-filter real-time, keyword di-highlight di preview teks
  │
  ▼ tap salah satu hasil
Detail Catatan terbuka, keyword tetap ter-highlight di isi lengkap
```

## Flow 5 — AI Tanya Jurnal (stretch, RAG sederhana)

```
Tab Tanya → ketik pertanyaan natural:
"terakhir kali aku beli galon kapan dan harganya berapa?"
        │
        ▼
1. Query diubah jadi embedding vector (model kecil di browser)
2. Bandingkan (cosine similarity) dengan embedding semua catatan tersimpan
3. Ambil 3–5 catatan paling relevan
        │
        ▼
Catatan relevan dikirim sebagai konteks ke model rangkuman/instruct kecil
        │
        ▼
AI menjawab dalam 1-2 kalimat + daftar catatan sumber yang dipakai
"Terakhir kamu mencatat beli galon pada [tanggal], seharga Rp20.000."
   → [lihat catatan asli]
        │
        ▼
Kalau tidak ditemukan catatan relevan: jawaban jujur
"Aku belum menemukan catatan tentang itu di jurnalmu."
(bukan mengarang jawaban — penting untuk kepercayaan user)
```

## Flow 6 — Reminder Notifikasi

```
Service Worker terdaftar saat app pertama dibuka
        │
        ▼
Jadwal reminder dihitung ulang tiap kali app dibuka
(berdasarkan frekuensi & jam yang diset user, disimpan di IndexedDB)
        │
        ▼
Saat waktunya tiba & app tidak sedang dibuka:
Notification API menampilkan notifikasi lokal
"Waktunya mencatat harimu ✍️"
        │
        ▼ tap notifikasi
Buka app langsung ke Home (siap rekam)
```

## Edge case yang perlu ditangani (checklist untuk development)

- [ ] User menolak izin mic → tampilkan pesan jelas + arahkan ke opsi "tulis manual" sebagai alternatif, jangan biarkan dead-end.
- [ ] User menolak izin notifikasi → reminder tetap tersimpan sebagai preferensi tapi beri catatan kecil di Settings bahwa notifikasi tidak aktif.
- [ ] Gemini API gagal/timeout (koneksi lambat, kuota habis, dsb) → tampilkan pesan jelas & tombol "coba lagi", jangan sampai audio yang sudah direkam hilang begitu saja — simpan dulu blob-nya di memory sampai berhasil diproses atau user membatalkan.
- [ ] Tidak ada koneksi internet saat mau merekam → beri tahu user bahwa fitur rekam & AI butuh internet, arahkan ke opsi "tulis manual" yang tetap bisa disimpan offline lewat Firestore offline persistence (akan sinkron otomatis saat online kembali).
- [ ] Cache browser dibersihkan / ganti device tanpa link akun → data anonymous auth akan hilang (uid baru ter-generate). Jelaskan ini dengan jujur di app (misal tooltip kecil di Settings: "Hubungkan email supaya datamu aman kalau ganti device") dan sebagai trade-off di proposal.
- [ ] Kuota free tier Firebase/Gemini tercapai (jarang terjadi untuk skala demo/lomba, tapi perlu diantisipasi) → tampilkan pesan error yang jelas, bukan crash diam-diam.
