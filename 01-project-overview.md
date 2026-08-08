# 01 — Project Overview

> Isi bab ini dipakai langsung untuk **BAB I PENDAHULUAN** dan **BAB II DESKRIPSI PROJECT** di proposal. Kalimat di bawah ditulis siap-pakai, tapi tetap sesuaikan dengan gaya bahasa tim & data riil (nama tim, jumlah anggota, dll).

## 2.1 Nama Project

Nama Project: **Gumam**

## 1.1 Latar Belakang

Mencatat jurnal harian (journaling) terbukti membantu kesehatan mental, membantu refleksi diri, dan menjadi arsip memori personal. Namun mayoritas orang berhenti journaling dalam waktu singkat karena dua hambatan utama:

1. **Friksi menulis.** Mengetik cerita panjang di hape setelah hari yang melelahkan terasa berat, sehingga niat mencatat sering hilang begitu saja.
2. **Sulit kembali menemukan catatan lama.** Setelah beberapa bulan, jurnal menumpuk jadi kumpulan teks yang tidak terstruktur — sulit dicari, sulit dilihat polanya, akhirnya jurnal jadi "kuburan data" yang tidak pernah dibuka lagi.

Voice journaling (mencatat dengan bicara, bukan mengetik) secara riset menurunkan friksi tersebut karena bicara jauh lebih cepat dan alami dibanding mengetik. Ditambah dengan AI yang bisa merangkum ucapan menjadi catatan terstruktur, serta membantu mencari kembali isi catatan lama dengan bahasa natural, dua hambatan utama journaling bisa diatasi sekaligus.

## 1.2 Rumusan Masalah

1. Bagaimana merancang aplikasi journaling yang meminimalkan friksi mencatat, terutama lewat suara?
2. Bagaimana memanfaatkan AI untuk mengubah rekaman suara menjadi catatan yang rapi dan mudah dibaca kembali, tanpa menghilangkan kontrol penuh user atas isi tulisannya?
3. Bagaimana membantu user menemukan kembali informasi spesifik dari ratusan catatan lama tanpa harus scroll manual?
4. Bagaimana menjaga user tetap konsisten mencatat dalam jangka panjang?
5. Bagaimana memastikan isi jurnal pribadi tetap privat, bahkan dari penyedia layanan sekalipun?

## 1.3 Tujuan Project

- Membangun PWA journaling berbasis suara yang bisa diinstall seperti aplikasi native, dengan friksi pencatatan seminimal mungkin.
- Mengintegrasikan AI untuk transkripsi, perangkuman otomatis, dan pencarian semantik atas isi jurnal.
- Menyediakan sistem reminder & streak untuk mendorong konsistensi mencatat.
- Menjamin privasi penuh: catatan hanya bisa dibaca oleh pemiliknya.

## 1.4 Manfaat Project

- **Bagi user:** proses mencatat jadi secepat bicara, arsip memori pribadi jadi mudah ditelusuri kembali (misalnya mengecek kapan terakhir kali membeli sesuatu dan berapa harganya), dan mendapat dorongan konsistensi lewat streak.
- **Bagi pengembangan produk:** menjadi studi kasus penerapan AI on-device/client-side untuk kasus data sensitif (jurnal pribadi), relevan untuk tren privacy-first AI app.
- **Bagi tema kompetisi:** menyentuh subtema Kesehatan (mental health via journaling) dan Produktivitas.

## 2.2 Deskripsi Singkat

Runut adalah PWA (Progressive Web App) voice journaling yang memungkinkan user mencatat harian cukup dengan berbicara. AI mentranskripsi dan merangkum ucapan menjadi catatan terstruktur yang tetap bisa diedit manual. Semua catatan tersimpan aman di perangkat user sendiri (bukan di server pihak ketiga), bisa dicari lewat kata kunci maupun tanya-jawab natural, dan dilengkapi sistem reminder serta streak untuk menjaga konsistensi mencatat.

## 2.3 Gambaran Umum

User pertama kali membuka app langsung mendapat akun anonim otomatis (tanpa perlu isi form), lalu diarahkan lewat onboarding singkat: menentukan frekuensi mencatat yang diinginkan (1x/hari, 2x/hari, tiap 2 hari, tiap 3 hari) dan menentukan jam reminder. Setelah itu, pengalaman utama app berputar di sekitar satu tombol besar "rekam" di halaman utama. User bicara, AI mentranskripsi & merangkum, user cek/edit hasilnya, simpan. Semua catatan bisa dilihat dalam tampilan list (seperti Google Keep) atau tampilan kalender per tanggal, dan dicari lewat search bar biasa maupun "tanya jurnal" berbasis AI.

## 2.4 Target Pengguna

- Mahasiswa/pelajar yang ingin membangun kebiasaan refleksi harian tapi malas mengetik panjang.
- Pekerja profesional yang butuh log harian cepat (ide, pengeluaran kecil, progres kerja) di sela kesibukan.
- Siapa pun yang pernah mencoba journaling app lain tapi berhenti karena "ribet nulis".

## 2.5 Solusi yang Ditawarkan

| Masalah | Solusi di Runut |
|---|---|
| Malas mengetik panjang | Rekam suara, AI yang merapikan jadi teks |
| Lupa/malas rutin mencatat | Reminder terjadwal + sistem streak |
| Susah cari catatan lama | Search kata kunci + AI tanya-jawab natural language |
| Takut privasi bocor | Isolasi data per akun lewat autentikasi & aturan akses server (sesama user tidak bisa saling melihat catatan) |
| Hasil AI kadang salah/kurang pas | Semua hasil AI tetap bisa diedit manual sebelum disimpan |

## 2.6 Keunggulan dan Inovasi

1. **Voice-first, bukan voice-optional.** Rekam jadi alur utama (bukan fitur tempelan di app teks biasa), dengan mengetik manual sebagai alternatif, bukan sebaliknya.
2. **AI backtracking search** — bukan cuma cari kata kunci biasa, tapi bisa tanya dengan bahasa natural ("terakhir beli galon kapan dan berapa harganya?") dan AI menjawab berdasarkan isi jurnal lama (lihat `07-ai-integration.md`).
3. **Isolasi data yang teruji, bukan sekadar klaim** — akses ditolak di level server (Firebase Security Rules) kalau `userId` tidak cocok, sehingga sesama user tidak mungkin saling mengintip catatan.
4. **100% gratis** — seluruh layanan (Firebase free tier, Gemini API free tier, hosting) tidak mengeluarkan biaya sepeser pun, sekaligus tetap "front-end only" karena tim tidak menulis kode server sendiri.
