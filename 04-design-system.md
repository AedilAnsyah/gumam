# 04 — Design System: Neumorphism (Soft UI)

> Sistem desain **Gumam** mengadopsi gaya **Neumorphism (Soft UI)** yang taktil, bersih, dan menenangkan. Desain ini memanfaatkan bayangan ganda halus (*dual soft shadows*) untuk menciptakan ilusi komponen fisik yang timbul (*raised/embossed*) atau amblas ke dalam (*sunken/inset*), dipadukan dengan aksen gelombang suara (*waveform*) dan navigasi gestur *swipe*.

---

## 🏛️ Prinsip Desain Utama

1. **Monochromatic Surface Blending:**
   * Warna latar belakang (*canvas*) dan warna kartu/komponen (*surface*) dibuat **persis sama** (`#E4E8EE` pada Light Mode dan `#1E232B` pada Dark Mode).
   * Kedalaman 3D tidak dibentuk oleh garis tepi hitam keras (*harsh borders*), melainkan oleh perpaduan bayangan terang (*light highlight*) di sudut kiri-atas dan bayangan gelap (*soft drop-shadow*) di sudut kanan-bawah.
2. **Spend Boldness in One Place:**
   * Aksen warna dan animasi paling ekspresif dicurahkan ke **Hero Moment**: Tombol Rekam Konsentris Taktil dan *Live Audio Waveform Visualizer*. Sisa layar tetap tenang tanpa kebisingan visual.
3. **Tactile Interaction & Haptic Feedback:**
   * Tombol beralih dari kondisi timbul (*raised*) menjadi amblas (*inset*) saat ditekan, disertai getaran mikro haptik (`navigator.vibrate`) di perangkat bergerak.
4. **Adaptive Gesture First:**
   * Mendukung gestur usap (*swipe left/right*) antar-tab utama dengan deteksi sudut cerdas tanpa menghambat scroll vertikal.

---

## A. Token Warna & Sistem Bayangan

### 1. Token Warna (CSS Variables)

```css
:root {
  /* Light Mode Neumorphism Palette (Default) */
  --color-canvas: #E4E8EE;        /* Background utama app */
  --color-surface: #E4E8EE;       /* Permukaan kartu, dock, & tombol */
  --color-surface-alt: #D8DFE8;   /* Warna elemen sekunder */

  /* Typography Colors */
  --color-ink: #2B3240;           /* Teks utama (Kontras AAA 10.5:1) */
  --color-ink-muted: #738096;     /* Teks sekunder, label, timestamp */

  /* Accent Colors */
  --color-accent: #3B828E;        /* Tombol rekam, CTA utama, waveform, streak */
  --color-accent-soft: #D1DEE2;   /* Background chip/tag terpilih */

  /* Status Colors */
  --color-success: #4E9A68;       /* Konfirmasi tersimpan, streak bertambah */
  --color-warning: #D99B26;       /* Peringatan & Grace Day streak */
  --color-danger: #D65A5A;        /* Tombol stop rekam, hapus catatan */

  /* Neumorphic Dual Shadows (Light Mode) */
  --neu-shadow-raised: 8px 8px 18px #c2c9d6, -8px -8px 18px #ffffff;
  --neu-shadow-raised-sm: 4px 4px 10px #c2c9d6, -4px -4px 10px #ffffff;
  --neu-shadow-raised-lg: 14px 14px 28px #bac2ce, -14px -14px 28px #ffffff;
  --neu-shadow-inset: inset 4px 4px 8px #c2c9d6, inset -4px -4px 8px #ffffff;
  --neu-shadow-inset-sm: inset 2px 2px 5px #c2c9d6, inset -2px -2px 5px #ffffff;
}

[data-theme="dark"],
.dark {
  /* Dark Mode Neumorphism Palette (Nocturne) */
  --color-canvas: #1E232B;        /* Obsidian slate navy */
  --color-surface: #1E232B;       /* Permukaan kartu gelap menyatu */
  --color-surface-alt: #272D37;

  /* Typography Colors */
  --color-ink: #E2E8F0;           /* Teks putih abu nyaman di mata */
  --color-ink-muted: #8E9BAE;     /* Teks metadata malam */

  /* Accent Colors */
  --color-accent: #76ABAE;        /* Bioluminescent cyan-teal glow */
  --color-accent-soft: #2C3A40;

  /* Status Colors */
  --color-success: #8FBF9F;
  --color-warning: #E3B23C;
  --color-danger: #D9736C;

  /* Neumorphic Dual Shadows (Dark Mode) */
  --neu-shadow-raised: 8px 8px 18px #13161c, -8px -8px 18px #29303a;
  --neu-shadow-raised-sm: 4px 4px 10px #13161c, -4px -4px 10px #29303a;
  --neu-shadow-raised-lg: 14px 14px 28px #0f1217, -14px -14px 28px #2d3440;
  --neu-shadow-inset: inset 4px 4px 8px #13161c, inset -4px -4px 8px #29303a;
  --neu-shadow-inset-sm: inset 2px 2px 5px #13161c, inset -2px -2px 5px #29303a;
}
```

---

## B. Tipografi

| Role | Typeface | Penggunaan di Antarmuka |
|---|---|---|
| **Display / Heading** | `Literata` *(Warm Editorial Serif)* | Judul halaman, headline onboarding, angka streak besar. Terasa personal dan hangat seperti buku catatan fisik. |
| **Body Text** | `Public Sans` | Teks hasil rangkuman AI, transkrip, deskripsi setelan. Sangat tajam dan nyaman dibaca panjang di mobile & desktop. |
| **Utility / Mono** | `JetBrains Mono` | Timer rekaman audio (`00:42`), timestamp tanggal/jam, hashtag tagar, dan badge metadata. |

Skala Tipografi:
```
--text-display-xl: 2.25rem / 1.2   (Headline Onboarding & Hero)
--text-display-lg: 1.75rem / 1.25  (Judul Halaman)
--text-heading-md: 1.25rem / 1.35  (Sub-judul & Modal Title)
--text-body-base: 0.9375rem / 1.65 (Isi Catatan & AI Rangkuman)
--text-body-sm: 0.8125rem / 1.5    (Keterangan & Metadata)
--text-mono-sm: 0.75rem / 1.4      (Timer, Tags, Pill Badges)
```

---

## C. Konsep Tata Letak & Komponen Kunci

### 1. Tombol Rekam Konsentris (*Concentric Beveled Dial*)
Tombol rekam besar di halaman utama dirancang dengan 3 cincin berundak ganda:
* **Ring Luar:** Timbul (`.neu-raised`) sebagai bingkai dial.
* **Ring Tengah:** Cekung (`.neu-inset-sm`) memberikan ilusi kedalaman mekanik.
* **Inti Tombol:** Timbul saat idle (`hover:neu-inset`), dan amblas cekung (`.neu-inset text-danger animate-pulse`) saat rekaman berlangsung.

### 2. Navigasi Melayang (*Floating Neumorphic Dock*)
Di mobile (< 768px), navigasi berupa dock melayang di bagian bawah layar:
* Tab inaktif memiliki bayangan timbul lembut.
* Tab aktif beralih menjadi cekung (`.neu-inset`) beraksen warna teal dan ikon membesar secara proporsional.

### 3. Widescreen Desktop Studio (≥ 768px)
* **Sidebar Kiri Persisten (256px):** Logo SVG dinamis, streak meter cekung, tombol cepat rekam, navigasi 4 tab, dan toggle Dark/Light mode instan.
* **Bento Grid 12-Kolom (7:5):** Kolom utama studio rekam berdampingan dengan kolom pemantik inspirasi (*Prompt Starters*) & spesifikasi AI.

---

## D. Gestur & Motion

1. **Horizontal Swipe Navigation:**
   * Menggeser layar ke kiri atau kanan memicu perpindahan tab secara instan.
   * Dilengkapi deteksi ambang jarak (60px) dan perbandingan sumbu $X > 1.5 \times Y$ agar tidak memblokir scroll vertikal.
2. **Haptic Micro-interactions:**
   * Getaran *double-pulse* saat memulai rekaman.
   * Getaran *single-pulse* saat menghentikan rekaman atau berpindah tab.
3. **Lazy Loading Transitions:**
   * Komponen `<PageSkeleton />` menampilkan modul bento berdenyut halus selama proses *code-splitting* halaman.
4. **Reduced Motion:**
   * Menghormati pengaturan `prefers-reduced-motion` untuk aksesibilitas pengguna.
