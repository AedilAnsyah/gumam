# 03 — Tech Stack (100% Gratis & Client-Side Only)

## Klarifikasi Aturan "Front-End Only"

Aturan lomba: *"Cakupan Pengembangan: Hanya sebatas tampilan Front-End. Adanya tambahan arsitektur Back-End tidak akan menjadi nilai tambah."*

Artinya: **backend custom (server buatan sendiri) tidak dinilai.** Oleh karena itu, arsitektur **Gumam** mengandalkan **BaaS (Backend-as-a-Service Firebase)** dan **Google Gemini REST API** yang dipanggil 100% dari sisi client tanpa server mandiri.

---

## 1. Framework, Build & Performance Layer

| Tool | Fungsi | Kenapa Dipilih | Biaya |
|---|---|---|---|
| **React 18 + Vite** | Kerangka aplikasi & Bundler | Setup instan, HMR kilat, performa tinggi | Gratis |
| **TypeScript** | Type safety & maintainability | Menaikkan nilai "Kualitas Kode" | Gratis |
| **React.lazy & Suspense** | Code-splitting rute dinamis | Mengurangi bundle awal, mempercepat *First Contentful Paint* | Gratis |
| **Tailwind CSS + Neumorphism Tokens** | Styling antarmuka taktil | Sistem bayangan ganda (*dual soft shadows*), bebas dependensi berat | Gratis |

---

## 2. PWA, Gestur & Interaktivitas

| Tool | Fungsi | Kenapa Dipilih | Biaya |
|---|---|---|---|
| **vite-plugin-pwa (Workbox)** | Service worker, Web App Manifest, precaching | Installable di mobile/desktop dengan offline capabilities | Gratis |
| **Touch Gestures API (`useSwipeNavigation`)** | Navigasi geser (*swipe tab*) | Interaksi alami jempol mobile tanpa memblokir scroll vertikal | Gratis |
| **Web Vibration API (`navigator.vibrate`)** | Haptic tactile feedback | Memberikan sensasi sentuhan fisik nyata saat menekan tombol & swipe | Gratis |
| **Web Notification API** | Pengingat jadwal jurnal lokal | Push pengingat terjadwal via Service Worker | Gratis |

---

## 3. Backend-as-a-Service (BaaS) — Auth & Database

| Komponen | Fungsi | Free Tier Limit | Keunggulan di Gumam |
|---|---|---|---|
| **Firebase Anonymous Auth** | Login instan tanpa form | Unlimited | Pengalaman pengguna tanpa friksi (*zero barrier*) |
| **Cloud Firestore** | Database dokumen catatan | 1GB storage, 50k read/hari | Offline persistence bawaan & Server-side Security Rules |
| **Firebase Storage** | Penyimpanan file audio asli | 5GB storage, 1GB/hari transfer | Aman terisolasi per `userId` pemilik catatan |

---

## 4. Voice Recording & AI Multimodal

| Komponen | Teknologi | Kenapa Dipilih |
|---|---|---|
| **Audio Capture** | `MediaRecorder API` + `AudioContext` + `AnalyserNode` | Merekam suara & visualisasi gelombang audio live tanpa library berat pihak ketiga |
| **Audio-to-Text & Summarization** | **Google Gemini 2.5 Flash API** (`gemini-2.5-flash`) | Menerima input audio Base64 langsung, menghasilkan transkrip mentah, ringkasan, mood, dan tag sekaligus |
| **Semantic Q&A** | **Google Gemini 2.5 Flash API** | Menjawab pertanyaan pencarian memori natural tanpa mengarang fakta (*anti-hallucination prompt*) |

---

## 5. Deployment & Hosting

| Layanan | Fungsi | Biaya |
|---|---|---|
| **Vercel / Netlify** | Static PWA hosting dengan HTTPS otomatis & global CDN | Gratis |
| **GitHub** | Version control & link repositori pengumpulan lomba | Gratis |
