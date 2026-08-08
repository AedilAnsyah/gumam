# 03 — Tech Stack (100% Gratis)

## Klarifikasi aturan "Front-End Only" (penting, mengubah beberapa keputusan di bawah)

Aturan lomba yang tepat: *"Cakupan Pengembangan: Hanya sebatas tampilan Front-End. Adanya tambahan arsitektur Back-End tidak akan menjadi nilai tambah."*

Artinya: **backend tidak dilarang, hanya tidak dinilai sebagai nilai tambah.** Yang tidak boleh/tidak berguna adalah membangun **server custom sendiri** (Express/Node server, database server yang kita kelola sendiri, dsb) karena itu di luar cakupan penilaian. Tapi memakai **layanan pihak ketiga (BaaS — Backend-as-a-Service)** seperti Firebase/Supabase untuk auth & database, atau memanggil **API AI cloud** langsung dari kode front-end, **tetap sah** — karena tim tidak menulis/mengelola kode server sama sekali, semua logic tetap ada di sisi client yang memanggil layanan managed.

Karena itu, dibanding versi sebelumnya, stack di bawah ini **diprioritaskan pakai layanan cloud gratis** untuk dua hal yang kamu khawatirkan:
1. **Akurasi AI membaca audio** — model kecil yang jalan di browser (Whisper tiny via Transformers.js) memang jauh lebih lemah dibanding model cloud. Untuk hasil transkripsi yang benar-benar akurat, pakai API cloud.
2. **Keamanan sederhana antar-user** — cukup pastikan user A tidak bisa lihat data user B, tidak perlu enkripsi end-to-end. Ini paling gampang & robust dicapai lewat auth + database rules dari BaaS, bukan dibangun manual dari nol di browser.

## 1. Framework & Build Tool

| Tool | Fungsi | Kenapa dipilih | Biaya |
|---|---|---|---|
| **React + Vite** | Kerangka aplikasi | Cepat setup, ekosistem PWA plugin matang | Gratis |
| **TypeScript** | Type safety | Menaikkan poin "Kualitas Kode" | Gratis |
| **Tailwind CSS** | Styling | Cepat & konsisten dengan design token custom | Gratis |

## 2. PWA Layer

| Tool | Fungsi | Biaya |
|---|---|---|
| **vite-plugin-pwa** (Workbox) | Service worker, manifest, caching | Gratis |
| **Notification API** (dijadwalkan via Service Worker) | Reminder | Gratis |

## 3. Backend-as-a-Service (BaaS) — untuk Auth & Database

> Ini **bukan** backend custom — tim tidak menulis satu baris pun kode server. Semua dipanggil langsung dari front-end lewat SDK resmi.

Pilih salah satu, keduanya setara untuk kebutuhan kita:

| Opsi | Fungsi | Free tier | Kenapa cocok |
|---|---|---|---|
| **Firebase** (Auth + Firestore + Storage) | Login/akun user, database catatan, penyimpanan file audio | Spark Plan (gratis selamanya, kuota cukup besar untuk kebutuhan lomba: 1GB Firestore storage, 10GB/bulan Storage, 50rb read/hari) | SDK front-end matang, dokumentasi banyak, gampang dipahami AI coding assistant |
| **Supabase** | Sama seperti di atas, tapi berbasis Postgres | Free tier: 500MB database, 1GB file storage | Kalau tim lebih familiar SQL/Postgres |

**Rekomendasi: Firebase**, karena Firestore Security Rules paling mudah dipakai untuk memastikan **isolasi data antar-user** (poin keamanan kamu) hanya dengan beberapa baris rule, tanpa perlu bangun sistem permission sendiri:

```
// Firestore Security Rules — contoh
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
                     && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Dengan rule di atas, **server Firebase sendiri yang menolak** permintaan baca/tulis kalau `userId` di data tidak cocok dengan user yang sedang login — jadi user lain secara teknis **tidak mungkin** mengakses catatan orang lain, walau mereka tahu ID dokumennya. Ini sudah cukup untuk requirement "sesama user tidak bisa saling intip", tanpa perlu enkripsi end-to-end (detail lengkap di `06-data-model-security.md`).

### Login/Akun User
- **Anonymous Auth** (Firebase) sebagai default — user langsung dapat akun unik begitu buka app pertama kali, **tanpa perlu isi form apa pun** (tetap frictionless, sesuai prinsip "sesederhana mungkin").
- **Opsional: Link ke email/Google Sign-In** dari Settings — supaya user yang mau, bisa "menyelamatkan" akunnya (login dari device lain, tidak hilang kalau cache browser dibersihkan). Ini stretch feature, bukan wajib.

## 4. Voice Recording & AI

### Rekaman Audio
| Tool | Fungsi | Biaya |
|---|---|---|
| **MediaRecorder API** (native browser) | Merekam audio dari mic | Gratis |

### AI: Transkripsi + Rangkuman (prioritas akurasi)

| Tool | Fungsi | Kenapa | Biaya |
|---|---|---|---|
| **Google Gemini API** (`gemini-2.5-flash` atau versi free tier terbaru — cek [ai.google.dev/pricing](https://ai.google.dev/pricing)) | Menerima **audio langsung sebagai input** (multimodal), lalu dalam satu request menghasilkan transkripsi + rangkuman terstruktur sekaligus | Jauh lebih akurat dibanding model kecil di browser, terutama untuk Bahasa Indonesia & audio dengan noise/aksen. Satu API call bisa langsung "dengar audio → keluarkan catatan rapi", menyederhanakan pipeline dibanding transkripsi manual dulu baru dirangkum terpisah | Free tier tersedia untuk personal/hobby use, cukup untuk kebutuhan demo & lomba |

**Cara panggil (contoh konsep, bukan production-hardening):**
```js
// Dikirim langsung dari front-end, audio blob di-encode base64
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: SYSTEM_INSTRUCTION_RANGKUM_JURNAL },
          { inline_data: { mime_type: "audio/webm", data: base64Audio } }
        ]
      }]
    })
  }
);
```

**Catatan jujur soal API key di front-end:** karena tidak ada backend, API key otomatis terlihat di kode client (bisa dilihat lewat DevTools). Untuk kebutuhan lomba/demo ini lazim & bisa diterima, tapi tetap:
- Set **API key restriction** di Google Cloud Console (batasi ke domain deploy kamu saja).
- Set **kuota harian** supaya tidak disalahgunakan orang lain kalau key ketahuan.
- Sebutkan ini secara transparan sebagai *known limitation* di proposal (BAB IV Saran/Pengembangan Selanjutnya) — bisa disebut solusinya nanti adalah proxy key lewat backend kecil (Cloud Functions) kalau dikembangkan lebih lanjut pasca-lomba.

### AI: Semantic Search / AI Tanya Jurnal
| Tool | Fungsi | Biaya |
|---|---|---|
| **Gemini API** (model yang sama), dipanggil dengan konteks catatan-catatan relevan sebagai bagian dari prompt (retrieval sederhana dari Firestore, bukan vector search canggih) | Menjawab pertanyaan natural language user berdasarkan isi jurnal | Termasuk dalam free tier yang sama |

> Untuk versi paling sederhana (cukup untuk lomba): retrieval dilakukan dengan **query Firestore biasa** (filter by keyword/tanggal) untuk mengambil kandidat catatan, baru dikirim ke Gemini untuk dirangkum jadi jawaban. Tidak perlu bangun vector database sendiri — itu over-engineering untuk scope lomba ini. (Kalau tim tetap ingin embedding search yang lebih canggih, opsi Transformers.js embedding masih bisa dipakai sebagai stretch — lihat catatan di bagian bawah.)

### Fallback Offline (opsional, stretch)
| Tool | Fungsi | Biaya |
|---|---|---|
| **Web Speech API** | Transkripsi cepat kalau tidak ada koneksi internet / mau demo tanpa API call | Gratis, bawaan browser (Chrome/Edge) |
| **Transformers.js + Whisper tiny** | Fallback transkripsi in-browser kalau device offline sama sekali | Gratis, tapi opsional — jangan jadi jalur utama karena akurasi lebih rendah (sesuai concern kamu) |

## 5. Penyimpanan Data

| Tool | Fungsi | Biaya |
|---|---|---|
| **Firestore** | Database catatan (teks, metadata, mood, tag) | Gratis (free tier) |
| **Firebase Storage** | Penyimpanan file audio (kalau user pilih simpan audio asli) | Gratis (free tier) |
| **IndexedDB (Dexie.js)** | Cache lokal untuk offline-first (baca cepat, tetap bisa buka app tanpa internet) | Gratis |

## 6. Deployment

| Tool | Fungsi | Biaya |
|---|---|---|
| **Vercel** / **Netlify** / **Firebase Hosting** | Hosting static PWA, HTTPS otomatis | Gratis |
| **GitHub** | Version control, "Link Repository" di lampiran | Gratis |

## Ringkasan Alur Data (revisi)

```
[Mic] → MediaRecorder → Audio Blob
                              │
                              ▼
              Gemini API (audio → transkrip + rangkuman
              dalam satu request, akurasi tinggi)
                              │
                              ▼
          User review/edit manual di UI
                              │
                              ▼
     Simpan ke Firestore (terisolasi per userId via
     Security Rules) + audio ke Firebase Storage (opsional)
                              │
                              ▼
     Cache ke IndexedDB lokal untuk akses offline-first
```

Semua panggilan di atas (Gemini API, Firebase SDK) dilakukan **langsung dari kode front-end**, tanpa server custom yang dikelola tim — sehingga tetap sejalan dengan batasan lomba, sekaligus memberi akurasi AI & keamanan data yang jauh lebih baik dibanding pendekatan full client-side murni.
