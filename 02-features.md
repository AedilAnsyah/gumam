# 02 — Fitur Aplikasi

Dikelompokkan jadi **MVP** (wajib ada, ini yang dinilai di "Fungsionalitas Produk" 25%) dan **Stretch** (nice-to-have, tambah nilai "Keunggulan & Inovasi" kalau sempat). Saran: kerjakan semua MVP dulu sampai benar-benar solid sebelum sentuh stretch — juri lebih menghargai fitur sedikit tapi jalan mulus, daripada banyak fitur tapi setengah jadi.

## A. Onboarding & Pengaturan

### MVP
- **Setup frekuensi mencatat** — pilihan: 1x/hari, 2x/hari, tiap 2 hari, tiap 3 hari. Disimpan sebagai preferensi, dipakai untuk logika reminder & streak.
- **Setup reminder** — pilih jam notifikasi. Pakai `Notification` + `Service Worker` (push lokal, bukan push server — gratis, tetap jalan karena PWA).
- **(Opsional saat onboarding) Setup kunci privasi** — PIN 6 digit atau passphrase, dipakai untuk enkripsi lokal. Lihat `06-data-model-security.md`.

### Stretch
- Ganti frekuensi/jam reminder kapan saja dari halaman Settings.
- Pilihan tema tampilan (light/dark/system).

## B. Merekam & Mencatat

### MVP
- **Tombol rekam besar** di halaman utama — 1 tap mulai rekam, 1 tap berhenti. Visual gelombang suara sederhana saat merekam supaya user tahu suaranya tertangkap.
- **Alternatif ketik manual** — toggle/tombol kecil "tulis manual" untuk user yang lagi tidak nyaman bicara (di tempat umum, dll).
- **Transkripsi otomatis** suara → teks oleh AI.
- **Rangkuman otomatis** — AI merapikan hasil transkripsi mentah (yang biasanya bertele-tele & ada "eee...anu...") menjadi catatan yang enak dibaca, tanpa mengubah makna/fakta yang diucapkan.
- **Pilihan simpan audio asli atau tidak** — modal konfirmasi setelah rekam: "Simpan juga rekaman aslinya?" Ya (audio + teks) / Tidak (teks saja, audio dihapus dari memory).
- **Edit manual hasil AI** sebelum atau sesudah disimpan — user selalu bisa mengoreksi apa pun.

### Stretch
- **Retry/re-record** sebelum konfirmasi simpan.
- **Mood tag** — AI mendeteksi mood dominan dari nada isi cerita (senang/sedih/netral/cemas/dll), user bisa override manual dengan emoji.
- **Auto-tagging** — AI mengusulkan 1–3 label singkat per catatan (misal: "belanja", "kerja", "keluarga") untuk mempermudah filter nanti.
- **Prompt starter saat bingung mulai bicara** — kalau user diam >5 detik setelah menekan rekam, tampilkan pertanyaan pemantik ringan ("Apa hal paling berkesan hari ini?").

## C. Melihat & Menjelajah Catatan

### MVP
- **Tampilan list** (seperti Google Keep/Notes) — urut dari terbaru, preview 2–3 baris, ikon kecil penanda "ada audio" kalau audio disimpan.
- **Tampilan kalender** — klik tanggal, muncul catatan di tanggal tersebut. Tanggal yang sudah ada catatan ditandai visual (dot/warna beda).
- **Search kata kunci** — cari string di judul/isi catatan, hasil di-highlight, urut relevansi/tanggal.
- **Detail catatan** — buka satu catatan, lihat teks lengkap + player audio (kalau ada) + tanggal/waktu + tag mood/label kalau ada.

### Stretch
- **AI Tanya Jurnal ("Tanya ke Runut")** — search bar mode alternatif: user ketik pertanyaan natural language ("terakhir beli galon kapan, harganya berapa?"), AI mencari & merangkum jawaban dari catatan-catatan relevan, lengkap dengan link ke catatan sumber. Ini fitur showcase AI paling kuat — detail teknis di `07-ai-integration.md`.
- **Filter lanjutan** — filter by tag, by mood, by rentang tanggal.
- **Ringkasan mingguan/bulanan** — AI membuat 1 paragraf recap otomatis ("Minggu ini kamu paling sering menulis tentang kerja, mood dominan netral cenderung positif...").
- **Timeline "on this day"** — menampilkan catatan di tanggal yang sama dari bulan/tahun sebelumnya (seperti "Memori" di Google Photos).

## D. Motivasi & Konsistensi

### MVP
- **Streak counter** — hitung hari berturut-turut sesuai frekuensi yang dipilih user (bukan cuma harian, harus menghitung sesuai target: kalau target "tiap 2 hari", streak tetap jalan selama user konsisten sesuai interval itu).
- **Indikator visual streak** di halaman utama (angka + ikon api/simbol lain yang sesuai desain).

### Stretch
- **Badge/pencapaian ringan** — milestone non-toxic (7 hari, 30 hari, 100 catatan, dst), ditampilkan sekali sebagai apresiasi, bukan gamifikasi berlebihan yang malah bikin tertekan.
- **Grace day** — 1x "izin bolong" per minggu tanpa memutus streak, supaya tidak terasa menghukum & lebih sehat secara psikologis.

## E. Privasi & Keamanan

### MVP
- **Akun otomatis (anonymous auth)** — user langsung dapat akun unik saat pertama buka app, tanpa isi form apa pun.
- **Isolasi data antar-user** — ditegakkan di level server lewat Firebase Security Rules, sehingga user A tidak mungkin mengakses/melihat catatan user B, walau dicoba lewat DevTools sekalipun. Detail di `06-data-model-security.md`.

### Stretch
- **Link akun ke email/Google Sign-In** — supaya user bisa login dari device lain & tidak kehilangan data kalau cache browser dibersihkan (anonymous auth terikat ke browser/device).
- **Auto-lock ringan** (misal PIN sederhana di layar depan) — ini murni UX lapis tambahan di device yang dipakai bersama, bukan mekanisme keamanan utama (keamanan utama tetap di server rules).
- **Export/backup data** — user bisa export catatan miliknya sendiri ke file (JSON/PDF) untuk arsip pribadi.

## F. PWA & Pengalaman Aplikasi

### MVP
- **Installable** — manifest.json + service worker, bisa "Add to Home Screen", ikon & splash screen custom.
- **Offline-friendly untuk data** — melihat & mengedit catatan yang sudah tersimpan tetap bisa tanpa internet berkat Firestore offline persistence (cache otomatis ke IndexedDB). Fitur yang butuh AI (rekam baru, AI Tanya Jurnal) tetap butuh koneksi internet karena memakai Gemini API cloud — ini trade-off yang diambil sadar demi akurasi AI (lihat `03-tech-stack.md`).

### Stretch
- **Animasi micro-interaction** yang halus & bertema (bukan cuma fade generic) — lihat `04-design-system.md`.

---

## Usulan fitur tambahan dari saya (di luar yang kamu sebutkan)

Saran prioritas kalau waktu terbatas: **AI Tanya Jurnal**, **Grace day untuk streak**, **mood tag ringan** — tiga ini paling murah dikerjakan tapi paling terasa dampaknya untuk penilaian "Fungsionalitas" & "Keunggulan/Inovasi".

Fitur lain yang sengaja **tidak** saya masukkan meski umum di app journaling lain: sosial/share ke publik (bertentangan dengan premis privasi jurnal), gamifikasi berat/leaderboard (tidak relevan untuk app personal & bisa terasa memaksa). Sinkronisasi multi-device sebenarnya **jadi lebih mudah** dengan arsitektur BaaS yang dipakai sekarang (data sudah di Firestore, bukan cuma lokal), jadi ini bisa jadi stretch feature yang murah untuk ditambahkan lewat "link akun ke email" di atas.
