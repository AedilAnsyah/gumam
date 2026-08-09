# 🎙️ Gumam — PWA Voice Journaling Berbasis AI (Neumorphic Soft UI)

> **Kompetisi:** BitsMikro Innovative VibeCode 2026  
> **Tema:** Kesehatan & Produktivitas  
> **Cakupan Pengembangan:** Front-End Only (Backend-as-a-Service Firebase + Gemini AI REST API, 100% Gratis)  

![Gumam PWA Banner](https://img.shields.io/badge/Gumam-Voice%20Journaling%20AI-3B828E?style=for-the-badge)
![BitsMikro 2026](https://img.shields.io/badge/BitsMikro-VibeCode%202026-1E232B?style=for-the-badge)
![Style](https://img.shields.io/badge/Style-Neumorphism%20(Soft%20UI)-E4E8EE?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TS%20%7C%20Tailwind-blue?style=for-the-badge)

---

## 📖 Tentang Project

**Gumam** adalah Progressive Web App (PWA) *voice journaling* berbasis AI yang dirancang untuk meminimalkan friksi mencatat harian. Cukup dengan bicarakan harimu secara alami, **Google Gemini 2.5 Flash Multimodal Engine** akan mentranskripsi ucapan dan merapikan ceritamu menjadi catatan jurnal yang terstruktur, rapi, dan mudah ditelusuri kembali tanpa menghilangkan fakta atau detail emosional.

Antarmuka Gumam mengadopsi estetika **Neumorphism (Soft UI)** yang taktil dan menenangkan — menggabungkan bayangan ganda halus (*dual soft shadows*), tombol konsentris berundak, navigasi gestur *swipe*, dan sistem tema ganda (Light & Dark Mode) yang 100% menyatu.

---

## ✨ Fitur Utama (MVP & Stretch Features)

### 🎙️ 1. Studio Rekam Suara Neumorphic & Waveform
- **Concentric Beveled Dial**: Tombol rekam konsentris taktil yang timbul saat idle dan amblas cekung saat merekam.
- **Real-time Waveform Visualizer**: Wadah audio cekung (*recessed bay*) dengan visualizer gelombang suara dinamis berbasis `AudioContext` + `AnalyserNode`.
- **Haptic Tactile Feedback**: Getaran mikro haptik (`navigator.vibrate`) saat mulai merekam, berhenti, dan menavigasi tab.
- **Alternatif Tulis Manual**: Mode ketik manual untuk situasi tidak nyaman berbicara di tempat umum.

### 🤖 2. Integrasi Multimodal Gemini AI Engine
- **Audio-to-Text & Summarization**: Gemini 2.5 Flash menerima input audio Base64 secara langsung, menghasilkan transkrip mentah + rangkuman rapi sekaligus dalam 1 request JSON terstruktur.
- **Review & Edit Screen**: Textarea hasil rangkuman AI dapat dikoreksi manual oleh pengguna sebelum disimpan ke cloud.
- **Auto Mood & Auto-Tagging**: AI mendeteksi mood dominan (*"Senang"*, *"Fokus"*, *"Lelah"*) dan mengusulkan 1-3 hashtag otomatis (`#Harian`, `#Belanja`).
- **AI Ringkasan Mingguan**: Menghasilkan 1 paragraf evaluasi tren mood dan topik mingguan dari seluruh catatan pengguna.

### 🔍 3. AI Tanya Jurnal (Natural Language Memory Search)
- **Semantic Q&A**: Pengguna dapat bertanya dengan bahasa alami (misal: *"Kapan terakhir beli galon dan berapa harganya?"*).
- **Anti-Halusinasi**: Gemini AI membaca riwayat catatan jurnal dan menjawab jujur tanpa mengarang data.
- **Pill Referensi Sumber**: Setiap jawaban menyertakan link catatan sumber yang dapat diklik langsung.

### 📱 4. Gestur Taktil & Navigasi Mobile/Desktop
- **Swipe Tab Navigation**: Geser layar ke kiri/kanan (*swipe gesture*) di HP untuk berpindah antar tab (Rekam ↔ Catatan ↔ Tanya ↔ Setelan) secara mulus.
- **Floating Neumorphic Dock**: Navigasi bawah melayang di mobile dengan tab aktif yang amblas ke dalam.
- **Desktop Multi-Column**: Fixed sidebar di desktop widescreen (≥ 768px) dengan split-view bento kalender & daftar catatan.

### ⚡ 5. Lazy Loading & Performa Tinggi
- **Code-Splitting Async Routes**: Setiap halaman dimuat secara lazy (`React.lazy` + `Suspense`) untuk mempercepat *Initial Load Time*.
- **Neumorphic Skeleton Fallback**: Layar transisi berdenyut halus bergaya soft UI tanpa layar putih kosong.

### 🌓 6. Sistem Tema 1-Klik (Light & Dark Mode)
- **Light Mode Neumorphism (`#E4E8EE`)**: Tampilan segar bertekstur keramik halus dengan bayangan terang putih dan bayangan gelap abu.
- **Dark Mode Neumorphism (`#1E232B`)**: Tampilan malam hari yang intim dengan pendaran aksen *bioluminescent cyan-teal* (`#76ABAE`).
- **Toggle Instan**: Switch tema instan di Mobile Header, Desktop Sidebar, dan Halaman Setelan.

### 🔥 7. Streak Motivator & Grace Day
- **Logika Streak Interval**: Menghitung keteraturan harian berdasarkan preferensi target frekuensi pengguna.
- **Grace Day**: 1x "izin bolong" per minggu tanpa mereset streak harian agar lebih sehat secara psikologis.

### 🔒 8. Privasi & Isolasi Data Per Akun
- **Anonymous Authentication**: Login otomatis tanpa form untuk pengalaman tanpa friksi.
- **Server-Side Security Rules**: Firebase Security Rules menegakkan isolasi data di level server (`request.auth.uid == resource.data.userId`).
- **Ekspor/Impor JSON**: Fitur unduh cadangan arsip jurnal format `.json`.

---

## 🛠️ Tech Stack (100% Gratis & Client-Side Only)

| Layer | Teknologi | Alasan Pemilihan |
|---|---|---|
| **Framework & Build** | React 18 + Vite + TypeScript | Performa cepat, type safety, code-splitting `React.lazy` |
| **Styling & UI System** | Tailwind CSS + Neumorphic Soft UI Tokens | Desain taktil kustom, dual shadows, dan responsivitas penuh |
| **BaaS (Auth & DB)** | Firebase Auth (Anonymous) + Firestore + Storage | Isolasi data server rules & offline persistence |
| **AI Multimodal** | Google Gemini API (`gemini-2.5-flash`) | Multimodal audio-to-text & semantic search natural |
| **PWA & Gestures** | `vite-plugin-pwa` + Web Notification + Touch API | Installable, service worker, & gesture swipe navigation |

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
├── public/                     # Icons, logo.svg, favicon.svg & manifest
├── src/
│   ├── assets/                 # High-res logo assets (logo.png, etc.)
│   ├── components/             # Reusable UI (Navbar, Header, DesktopSidebar, GumamLogo, ThemeToggle, Calendar, Waveform, PageSkeleton)
│   ├── features/               # Feature Modules (Lazy Loaded)
│   │   ├── entries/            # EntriesPage & EntryDetailPage
│   │   ├── onboarding/         # OnboardingPage (3-step stepper)
│   │   ├── recording/          # RecordPage (Neumorphic Studio & Visualizer)
│   │   ├── search/             # SearchAskPage (AI Tanya Jurnal)
│   │   ├── settings/           # SettingsPage & Theme Switcher
│   │   └── streak/             # StreakBadge Component
│   ├── lib/                    # Core Utilities (ai.ts, firebase.ts, entries.ts, notifications.ts, useSwipe.ts, theme.ts)
│   ├── types/                  # TypeScript Type Definitions
│   ├── App.tsx                 # Responsive Layout, Router, Suspense & Gesture Hook
│   ├── main.tsx                # React Mount Point
│   └── index.css               # Neumorphism CSS Variables & Dual Shadow Tokens
├── firestore.rules             # Server-side Firestore Security Rules
├── storage.rules               # Server-side Storage Security Rules
├── LOG-PERCAKAPAN.md           # Log Lengkap Alur Prompting & Implementasi
└── README.md                   # Dokumentasi Utama Repo
```

---

## 📝 Log Percakapan Prompting (Untuk Penilaian Kompetisi)

Seluruh riwayat prompting dan alur pemikiran perencanaan hingga implementasi per tahap dapat diakses pada berkas **[LOG-PERCAKAPAN.md](./LOG-PERCAKAPAN.md)**.

---

**Dikembangkan oleh Tim Calon Manajer Kopdes untuk BitsMikro Innovative VibeCode 2026.**
