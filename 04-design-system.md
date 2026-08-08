# 04 — Design System

> Palet warna sudah ditentukan tim (lihat swatch yang di-upload): navy gelap, slate gelap, teal lembut, dan abu terang. Bagian di bawah sudah diisi dengan hex final hasil sampling langsung dari gambar, plus turunan warna tambahan yang dibutuhkan (muted text, accent-soft, status colors) supaya konsisten satu sistem. Semua bagian lain (tipografi, layout, motion, signature element) tetap seperti rancangan awal karena memang tidak bergantung warna spesifik.

## Prinsip desain untuk project ini

Tiga look yang paling sering muncul di hasil AI-generated design dan **wajib dihindari** supaya tidak terkesan "AI slop":
1. Background krem hangat (`#F4F1EA`-ish) + font serif kontras tinggi + aksen terracotta/clay oranye kemerahan (`#D97757`-ish).
2. Background hitam pekat + satu aksen hijau neon/vermilion tunggal.
3. Layout ala koran/broadsheet: garis tipis (hairline), sudut kotak tegas (border-radius 0), kolom padat.

Ketiganya boleh dipakai **hanya kalau** memang sengaja jadi pilihan sadar tim (misal tema jurnal memang ingin terasa seperti buku catatan lama bergaya koran) — tapi untuk project journaling personal yang intim & tenang, arah yang lebih pas justru **menjauh** dari ketiganya.

**Palet yang dipilih tim** (navy `#222831` → slate `#31363F` → teal `#76ABAE` → abu terang `#EEEEEE`) secara aman berada di luar ketiga default di atas: bukan krem+terracotta, dan meski basis-nya gelap, ini bukan hitam pekat dengan aksen neon — navy-nya punya undertone biru-abu yang tenang, dan teal-nya desaturated/lembut, bukan hijau/vermilion neon yang menyala. Kombinasi ini justru punya karakter yang pas untuk journaling: **gelap dan hening seperti menulis di malam hari, dengan satu warna teal yang tenang seperti riak air** — selaras dengan signature element waveform (gelombang suara terasa natural dipasangkan dengan warna yang mengingatkan pada air/riak, bukan kebetulan).

**Signature element** yang diusulkan untuk app ini: visual **gelombang suara (waveform)** sebagai elemen berulang yang bermakna — dipakai saat merekam (real-time), sebagai dekorasi halus di halaman kosong/onboarding, dan sebagai bentuk dari streak indicator (bukan ikon api generic, tapi waveform yang "hidup" sesuai jumlah streak, diwarnai teal `#76ABAE`). Ini konkret karena app-nya memang tentang suara, bukan dekorasi yang ditempel begitu saja.

## A. Color Token

```css
:root {
  /* Warna dasar / permukaan — navy gelap sebagai canvas utama */
  --color-canvas: #222831;        /* background utama app */
  --color-surface: #31363F;       /* kartu catatan, modal, bottom sheet */
  --color-surface-alt: #3B424D;   /* kartu catatan versi hover/aktif (surface diterangkan ~10%) */

  /* Warna teks */
  --color-ink: #EEEEEE;           /* teks utama, kontras 12.8:1 di atas canvas — jauh di atas AA */
  --color-ink-muted: #A2A4A8;     /* teks sekunder / metadata (tanggal, label kecil) — campuran ink & surface */

  /* Warna aksen — satu aksen utama, teal dari palet */
  --color-accent: #76ABAE;        /* tombol rekam, CTA utama, streak aktif, waveform */
  --color-accent-soft: #3A4B52;   /* versi gelap-teal untuk background chip/tag terpilih, highlight search di atas surface gelap */

  /* Warna status — diselaraskan ke saturasi rendah supaya senada dengan palet, bukan warna default browser */
  --color-success: #8FBF9F;       /* konfirmasi tersimpan, streak bertambah */
  --color-warning: #E3B23C;       /* peringatan ringan (mis. kuota storage) */
  --color-danger: #D9736C;        /* hapus catatan, error */
}
```

**Varian Light Mode (stretch, opsional)** — derivasi dari palet yang sama, bukan palet baru:
```css
[data-theme="light"] {
  --color-canvas: #EEEEEE;
  --color-surface: #FFFFFF;
  --color-surface-alt: #E4E4E4;
  --color-ink: #222831;
  --color-ink-muted: #5C6470;
  --color-accent: #4C8285;        /* teal digelapkan sedikit supaya tetap kontras AA di atas background terang */
  --color-accent-soft: #DCEAEA;
}
```

**Catatan pemilihan warna:**
- Kontras `--color-ink` (`#EEEEEE`) terhadap `--color-canvas` (`#222831`) terukur **~12.8:1** — jauh melewati syarat WCAG AA (4.5:1), bahkan lolos AAA.
- `--color-accent` (`#76ABAE`) terhadap `--color-canvas` terukur **~5.8:1** — aman dipakai untuk teks besar/ikon/tombol, tapi tetap hindari dipakai untuk body text panjang (pakai `--color-ink` untuk itu).
- `--color-accent` dipakai sangat hemat — hanya untuk 1–2 elemen paling penting per layar (tombol rekam, indikator streak aktif, waveform), bukan disebar ke semua tombol/link.
- Untuk light mode, `--color-accent` sengaja digelapkan (`#4C8285` bukan `#76ABAE` mentah) karena teal asli terlalu terang untuk kontras AA di atas background putih/terang — turunan warna, bukan warna baru, tapi tetap perlu disesuaikan per konteks kontras.

## B. Typography

Pilih 2 typeface, bukan default sistem/Inter-untuk-segalanya:

| Role | Kebutuhan | Contoh pilihan gratis (Google Fonts) yang tidak generic |
|---|---|---|
| **Display** (judul, headline, angka streak besar) | Karakter kuat tapi tetap tenang & personal, cocok dibaca di atas background gelap — hindari serif tebal kontras tinggi ala template no.1 di atas | `Literata` (serif hangat yang memang dirancang untuk membaca panjang, terasa seperti "buku catatan", dan tetap nyaman di dark background), `Fraunces`, `Newsreader`, atau arah sans berkarakter: `Bricolage Grotesque` |
| **Body** (isi catatan, UI copy) | Nyaman dibaca panjang di atas navy gelap, netral tapi tidak steril | `Public Sans`, `Karla`, `Sofia Sans` — hindari `Inter` polos supaya tidak terasa default template |
| **Utility/mono** (timestamp, durasi rekaman, angka streak kecil) | Mono untuk data numerik supaya terasa presisi, warnai dengan `--color-ink-muted` atau `--color-accent` tergantung konteks | `JetBrains Mono`, `IBM Plex Mono` |

Tetapkan skala tipografi (contoh, sesuaikan):
```
--text-display-xl: 2.75rem / 1.1   (angka streak besar, headline onboarding)
--text-display-lg: 2rem / 1.15     (judul halaman)
--text-body: 1rem / 1.6            (isi catatan)
--text-caption: 0.8125rem / 1.4    (metadata, timestamp)
```

## C. Layout Concept

Karena ini PWA yang dipakai sehari-hari (bukan landing page sekali lihat), prioritaskan **kejelasan & kecepatan akses**, bukan showcase visual berlebihan.

Konsep layout yang diusulkan — **"Notebook Tab"**: navigasi utama berbentuk seperti tab pembatas buku catatan fisik (bukan bottom nav generic ala Material Design biasa), diletakkan menempel di satu sisi layar. Tiga tab: **Rekam** (default/home), **Catatan** (list/kalender), **Tanya** (AI search).

ASCII wireframe halaman utama (Rekam):

```
┌─────────────────────────────┐
│  🌊 streak: 12  [waveform]   │  <- streak indicator warna teal (--color-accent), bentuk waveform bukan ikon api
│                               │
│                               │
│         ╭───────────╮        │
│         │           │        │
│         │    ◉      │        │  <- tombol rekam besar, pusat layar
│         │           │        │
│         ╰───────────╯        │
│                               │
│      "ketuk untuk mulai"     │
│                               │
│   [tulis manual sebagai      │
│    gantinya →]                │
├───┬───────────┬─────────────┤
│Rek│  Catatan   │    Tanya    │  <- tab navigasi bawah/samping
└───┴───────────┴─────────────┘
```

ASCII wireframe tampilan Catatan (list vs kalender, toggle di atas):

```
┌─────────────────────────────┐
│  Catatan     [List | 📅]     │
│  🔍 cari isi catatan...      │
├─────────────────────────────┤
│  Hari ini, 14:20             │
│  "Tadi beli galon di warung  │
│   sebelah, harganya 20rb..." │
│  🎧 audio tersimpan          │
├─────────────────────────────┤
│  Kemarin, 09:10               │
│  "Rapat pagi berjalan..."    │
│  #kerja  🙂                  │
└─────────────────────────────┘
```

## D. Motion

Sesuai prinsip "spend boldness in one place": animasi paling berkarakter dicurahkan ke **momen merekam** (waveform real-time yang responsif terhadap volume suara — ini "hero moment" app), sisanya dibuat halus & minimal:

- **Saat rekam:** waveform bar bergerak real-time mengikuti amplitude audio (pakai `AudioContext` + `AnalyserNode`, native browser, gratis).
- **Transisi antar tab:** cukup fade/slide singkat (150–200ms), hindari animasi berlebihan yang terasa "dipaksakan AI".
- **Streak update:** satu animasi kecil & memuaskan saat streak bertambah (bukan confetti besar-besaran — journaling adalah aktivitas tenang, bukan game).
- Hormati `prefers-reduced-motion` — matikan animasi non-esensial untuk user yang mengaktifkan setting itu di OS.

## E. Komponen Kunci (checklist untuk di-build)

- [ ] Tombol rekam (3 state: idle, recording, processing/AI bekerja)
- [ ] Waveform visualizer (live saat rekam, static/mini di kartu catatan yang punya audio)
- [ ] Kartu catatan (list view)
- [ ] Kalender bulanan dengan dot penanda tanggal berisi catatan
- [ ] Search bar dengan 2 mode (kata kunci / tanya AI) — pertimbangkan toggle atau segmented control, bukan dua search bar terpisah
- [ ] Modal konfirmasi simpan (dengan/tanpa audio)
- [ ] Streak indicator (versi kecil di header, versi besar di halaman utama)
- [ ] Empty state (belum ada catatan sama sekali — jadikan ajakan bertindak, bukan sekadar "no data")
- [ ] Onboarding flow (2 langkah: frekuensi → jam reminder)
