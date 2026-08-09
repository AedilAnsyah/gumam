# 02 — Fitur Aplikasi Gumam

Dikelompokkan menjadi **MVP** (fitur dasar yang dinilai di "Fungsionalitas Produk" 25%) dan **Stretch & Advanced UX** (nilai tambah "Keunggulan & Inovasi" 15%).

---

## A. Onboarding & Pengaturan

### MVP
- **Setup frekuensi mencatat** — pilihan: 1x/hari, 2x/hari, tiap 2 hari, tiap 3 hari. Disimpan sebagai preferensi lokal & sinkronisasi Firestore.
- **Setup reminder** — pilih jam notifikasi lokal (`Notification API` + `Service Worker`).
- **Anonim Auto-Login** — akun otomatis siap pakai saat first launch tanpa form login.

### Stretch & Advanced UX
- **Theme Switcher 1-Klik** — toggle instan Light Mode Neumorphism (`#E4E8EE`) dan Dark Mode (`#1E232B`) di Header, Sidebar, dan Setelan.
- **Ekspor/Impor Cadangan Data JSON** — backup seluruh dokumen jurnal dan preferensi ke file `.json`.
- Ganti frekuensi dan jam reminder kapan saja dari halaman Setelan.

---

## B. Merekam & Mencatat (Studio Studio Neumorphic)

### MVP
- **Tombol Rekam Konsentris Taktil** — dial berundak 3-ring yang timbul saat idle dan amblas cekung saat merekam.
- **Live Waveform Visualizer** — audio visualizer real-time di dalam wadah cekung (*recessed bay*).
- **Haptic Vibration Feedback** — getaran taktil mikro (`navigator.vibrate`) saat mulai dan menghentikan rekaman.
- **Alternatif Tulis Manual** — mode ketik teks langsung bagi pengguna di ruang umum.
- **Transkripsi & Rangkuman AI Gemini 2.5 Flash** — mengubah audio menjadi transkrip mentah dan ringkasan terstruktur dalam 1 panggilan API JSON.
- **Edit Manual Hasil AI** — textarea interaktif untuk mengoreksi ringkasan sebelum disimpan.
- **Pilihan Simpan Audio Asli** — modal konfirmasi: simpan audio ke Firebase Storage atau hanya teks.

### Stretch & Advanced UX
- **Auto Mood Tagging** — deteksi otomatis mood dominan (*Senang, Lelah, Fokus, Netral*).
- **Auto Topic Hashtags** — AI mengusulkan 1–3 hashtag kontekstual per catatan (`#Kerja`, `#Refleksi`).
- **Prompt Starters Desktop** — kartu pemantik ide bicara saat pengguna bingung memulai cerita.

---

## C. Melihat & Menjelajah Catatan

### MVP
- **Daftar List Bento** — kartu catatan berbayang timbul lembut, cuplikan isi, penanda audio, dan mood pill.
- **Kalender Interaktif** — navigasi bulan sirkular dengan tanggal-tanggal bulat penanda entri catatan.
- **Pencarian Kata Kunci & Highlight** — filter teks cepat dengan penanda teks tersorot (*highlighted mark*).
- **Detail Catatan & Audio Player** — pemutar suara dengan track progress cekung dan aksi edit/hapus.

### Stretch & Advanced UX
- **AI Tanya Jurnal (Semantic Natural Language Q&A)** — tanya memori masa lalu dengan bahasa natural, dijawab AI tanpa halusinasi dengan kartu link referensi catatan sumber.
- **AI Weekly Recap** — pembuatan 1 paragraf ringkasan mingguan otomatis tren topik & mood pengguna.

---

## D. Gestur & Pengalaman Pengguna (Mobile & Desktop)

### MVP
- **PWA Installable & Offline-First** — dapat di-install di layar HP/Desktop dengan IndexedDB cache Firestore.
- **Desain Responsif Multi-Column** — tata letak fleksibel: Floating Dock di Mobile dan Fixed Sidebar 256px di Desktop Widescreen.

### Stretch & Advanced UX
- **Horizontal Swipe Navigation** — geser layar (*swipe left/right*) di HP untuk berpindah antar 4 tab utama (Rekam ↔ Catatan ↔ Tanya ↔ Setelan).
- **Lazy Loading & Code-Splitting** — optimasi performa rute dengan `React.lazy()` dan fallback `<PageSkeleton />` berdenyut lembut.
- **Grace Day Streak** — 1x toleransi "izin bolong" per minggu tanpa mereset hitungan streak harian.
