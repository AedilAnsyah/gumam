# 🎙️ Gumam — PWA Voice Journaling Berbasis AI

> **Kompetisi:** BitsMikro Innovative VibeCode 2026  
> **Tema:** Kesehatan & Produktivitas  
> **Cakupan Pengembangan:** Front-End Only (Backend-as-a-Service Firebase + Gemini AI REST API, 100% Gratis)  

![Gumam PWA Banner](https://img.shields.io/badge/Gumam-Voice%20Journaling%20AI-76ABAE?style=for-the-badge)
![BitsMikro 2026](https://img.shields.io/badge/BitsMikro-VibeCode%202026-222831?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS%20%7C%20Tailwind-blue?style=for-the-badge)

---

## 📖 Tentang Project

**Gumam** adalah Progressive Web App (PWA) *voice journaling* berbasis AI yang dirancang untuk meminimalkan friksi mencatat harian. Cukup dengan bicarakan harimu secara alami, **Google Gemini 2.5 Flash Multimodal Engine** akan mentranskripsi ucapan dan merapikan ceritamu menjadi catatan jurnal yang terstruktur, rapi, dan mudah ditelusuri kembali tanpa menghilangkan fakta atau detail spesifik.

---

## ✨ Fitur Utama (MVP & Stretch Features)

### 🎙️ 1. Voice-First Studio Recording & Real-time Waveform
- **One-tap Record**: 1 ketukan untuk mulai dan berhenti merekam.
- **Real-time Waveform Visualizer**: Animasi gelombang suara real-time berbasis `AudioContext` + `AnalyserNode` browser native.
- **Alternatif Tulis Manual**: Mode ketik manual untuk situasi tidak nyaman berbicara di tempat umum.

### 🤖 2. Integrasi Multimodal Gemini AI Engine
- **Audio-to-Text & Summarization**: Gemini 2.5 Flash menerima input audio Base64 secara langsung, menghasilkan transkrip mentah + rangkuman rapi sekaligus dalam 1 request JSON.
- **Review & Edit Screen**: Textarea hasil rangkuman AI dapat dikoreksi manual oleh pengguna sebelum disimpan.
- **Auto Mood & Auto-Tagging**: AI mendeteksi mood dominan (*"Senang"*, *"Fokus"*, *"Lelah"*) dan mengusulkan 1-3 hashtag otomatis (`#Harian`, `#Belanja`).

### 🔍 3. AI Tanya Jurnal (Natural Language Memory Search)
- **Semantic Q&A**: Pengguna dapat bertanya dengan bahasa alami (misal: *"Kapan terakhir beli galon dan berapa harganya?"*).
- **Anti-Halusinasi**: Gemini AI membaca riwayat catatan jurnal dan menjawab jujur tanpa mengarang data.
- **Pill Referensi Sumber**: Setiap jawaban menyertakan link catatan sumber yang dapat diklik langsung.

### 🔥 4. Streak Counter & Grace Day Motivator
- **Logika Streak Interval**: Menghitung keteraturan harian berdasarkan preferensi target frekuensi pengguna.
- **Grace Day**: 1x "izin bolong" per minggu tanpa mereset streak harian agar lebih sehat secara psikologis.

### 🔒 5. Privasi & Isolasi Data Per Akun
- **Anonymous Authentication**: Login otomatis tanpa form untuk pengalaman tanpa friksi.
- **Server-Side Security Rules**: Firebase Security Rules menegakkan isolasi data di level server (`request.auth.uid == resource.data.userId`).

### 📱 6. Desain Responsive Native (Mobile PWA & Desktop Widescreen)
- **Mobile View**: PWA *Notebook Tab* navigation bar di bagian bawah.
- **Desktop Widescreen**: Multi-column studio layout dengan Sidebar persisten di kiri (`md:flex`), split-view kalender & daftar catatan, serta kartu prompt pemantik tulisan.

### 🔔 7. Reminder Notifikasi & Offline-First
- **Local PWA Notification**: Penjadwalan reminder pengingat lokal via Service Worker PWA (`Notification API`).
- **Offline Persistence**: Firestore offline persistence menyimpan data di IndexedDB lokal agar dapat dibaca tanpa koneksi internet.
- **Ekspor/Impor JSON**: Fitur unduh cadangan arsip jurnal format `.json`.

---

## 🛠️ Tech Stack (100% Gratis & Client-Side Only)

| Layer | Teknologi | Alasan Pemilihan |
|---|---|---|
| **Framework & Build** | React 18 + Vite + TypeScript | Performa cepat, type safety, PWA plugin matang |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Design system custom (`canvas`, `surface`, `accent`) |
| **BaaS (Auth & DB)** | Firebase Auth (Anonymous) + Firestore + Storage | Isolasi data server rules & offline persistence |
| **AI Multimodal** | Google Gemini API (`gemini-2.5-flash`) | Akurasi tinggi membaca audio Bahasa Indonesia |
| **PWA Layer** | `vite-plugin-pwa` + Web Notification API | Installable, service worker, & local push prompt |

---

## 🚀 Panduan Jalankan Secara Lokal

### Prerequisites
- Node.js (versi 18 ke atas)
- Git & npm

### Langkah Instalasi
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/AedilAnsyah/gumam.git
   cd gumam
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Pengaturan Environment Variables**:
   Salin file `.env.example` menjadi `.env` dan isi API key Anda:
   ```bash
   cp .env.example .env
   ```
   Isi variabel di `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=gumam-pwa.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=gumam-pwa
   VITE_FIREBASE_STORAGE_BUCKET=gumam-pwa.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5173/`.

5. **Build Produksi**:
   ```bash
   npm run build
   ```

---

## 📂 Struktur Direktori

```
Gumam/
├── public/                     # Icons & manifest assets
├── src/
│   ├── components/             # Reusable UI (Navbar, Header, DesktopSidebar, Calendar, Waveform)
│   ├── features/               # Feature Modules
│   │   ├── entries/            # EntriesPage & EntryDetailPage
│   │   ├── onboarding/         # OnboardingPage (3-step stepper)
│   │   ├── recording/          # RecordPage (Mic Studio & Visualizer)
│   │   ├── search/             # SearchAskPage (AI Tanya Jurnal)
│   │   ├── settings/           # SettingsPage & Theme Switcher
│   │   └── streak/             # StreakBadge Component
│   ├── lib/                    # Core Utilities (ai.ts, firebase.ts, entries.ts, notifications.ts)
│   ├── types/                  # TypeScript Type Definitions
│   ├── App.tsx                 # Main Responsive Layout & Router
│   ├── main.tsx                # React Mount Point
│   └── index.css               # Design System CSS Variables
├── firestore.rules             # Server-side Firestore Security Rules
├── storage.rules               # Server-side Storage Security Rules
├── LOG-PERCAKAPAN.md           # Log Lengkap Alur Prompting & Implementasi
└── README.md                   # Dokumentasi Utama Repo
```

---

## 📝 Log Percakapan Prompting (Untuk Penilaian Kompetisi)

Seluruh riwayat prompting dan alur pemikiran perencanaan hingga implementasi per tahap dapat diakses pada berkas **[LOG-PERCAKAPAN.md](./LOG-PERCAKAPAN.md)**.

---

**Dikembangkan oleh Tim Gumam untuk BitsMikro Innovative VibeCode 2026.**
