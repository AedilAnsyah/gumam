# 07 — Integrasi AI (Detail Peran & Arsitektur)

Dokumen ini menjawab poin **"Pemanfaatan AI"** yang wajib ada di materi pitching (poin 5). Revisi dari versi sebelumnya: prioritas dipindah dari model kecil di browser ke **Gemini API cloud**, supaya akurasi transkripsi & pemahaman audio jauh lebih baik — terutama untuk Bahasa Indonesia, aksen, dan audio dengan noise, yang jadi concern utama kalau full client-side.

## Peta 3 Titik Peran AI

### 1 & 2 (digabung) — Transkripsi + Rangkuman dalam Satu Panggilan

Karena Gemini bersifat **multimodal** (bisa menerima audio langsung sebagai input, tidak perlu diubah ke teks dulu secara terpisah), pipeline-nya lebih sederhana & lebih akurat dibanding pendekatan 2-tahap (transkripsi lalu rangkum terpisah) — model langsung "mendengar" audio dan menghasilkan catatan yang sudah rapi, sekaligus transkrip mentahnya.

- **Input:** audio blob hasil rekaman (di-encode base64), dikirim langsung ke Gemini API.
- **System instruction (contoh, sesuaikan saat implementasi):**
  > "Kamu akan menerima rekaman suara seseorang yang sedang mencatat jurnal harian dalam Bahasa Indonesia. Tugasmu:
  > 1. Transkripsikan ucapan tersebut apa adanya.
  > 2. Buat versi rapi dari transkrip itu sebagai catatan jurnal yang enak dibaca — pertahankan semua fakta, angka, nama, tanggal, dan detail spesifik persis seperti yang diucapkan, jangan menambah atau mengurangi informasi apa pun. Hilangkan hanya kata pengisi ('eee', 'anu') dan pengulangan yang tidak perlu.
  > 3. Balas dalam format JSON: `{ "transcript_raw": "...", "summary": "..." }`."
- **Output:** JSON berisi transkrip mentah & rangkuman, ditampilkan di layar Review untuk diedit user sebelum disimpan.
- **Kenapa instruksi menekankan "jangan menambah fakta":** krusial supaya AI tidak berhalusinasi mengubah harga/angka/tanggal — langsung berkaitan dengan use case pencarian ("beli galon 20rb") yang butuh akurasi tinggi.
- **Kenapa minta output JSON:** memudahkan parsing di kode front-end, dan konsisten dipakai di seluruh app (bukan free-text yang perlu di-regex).

### 3. Semantic Search / AI Tanya Jurnal

- **Input:** pertanyaan natural language dari user, misal "terakhir aku beli galon kapan dan harganya berapa?"
- **Proses (retrieval sederhana, tanpa perlu vector database):**
  1. Ambil kandidat catatan dari Firestore — bisa mulai dari pendekatan paling sederhana: ambil N catatan terbaru (misal 50–100 terakhir), atau filter dulu dengan keyword matching sederhana kalau jumlah catatan sudah banyak.
  2. Kirim isi catatan-catatan kandidat itu (ringkas: tanggal + content) sebagai konteks ke Gemini, bersama pertanyaan user.
- **System instruction (contoh):**
  > "Berikut kumpulan catatan jurnal user beserta tanggalnya. Jawab pertanyaan user HANYA berdasarkan catatan yang diberikan. Sertakan tanggal catatan yang relevan sebagai referensi. Kalau informasinya tidak ditemukan di catatan yang diberikan, katakan dengan jujur bahwa kamu tidak menemukannya — jangan mengarang jawaban."
- **Output:** jawaban singkat + tanggal catatan sumber, ditampilkan dengan link ke catatan aslinya agar user bisa verifikasi.
- **Catatan skalabilitas:** untuk kebutuhan lomba (data demo tidak akan sampai ribuan catatan), pendekatan "kirim semua/kandidat catatan sebagai konteks" ini sudah cukup & jauh lebih simpel diimplementasikan dibanding vector search. Kalau tim ingin menunjukkan sesuatu yang lebih advanced, embedding search (Transformers.js, lihat catatan stretch di `03-tech-stack.md`) bisa ditambahkan belakangan tanpa mengubah keseluruhan arsitektur.

## Kenapa Pendekatan Ini Tetap Kuat untuk Kriteria "AI sebagai Komponen Utama"

AI di sini bukan fitur tempelan (seperti chatbot generic yang ditambahkan di pojok layar), melainkan **inti dari fungsi utama app**: tanpa AI, fitur rekam-jadi-catatan-rapi tidak akan berfungsi sama sekali, dan fitur pencarian natural language juga tidak akan bisa dijalankan. Ini penting untuk ditekankan di narasi pitching poin 5.

## Fitur AI Tambahan (opsional, kalau waktu cukup)

| Fitur | Peran AI |
|---|---|
| Mood detection | Minta Gemini sertakan field `mood` tambahan di response JSON Tahap 1&2 (tidak perlu panggilan API terpisah) |
| Auto-tagging | Sama — minta field `tags` tambahan di response JSON yang sama |
| Ringkasan mingguan | Kirim gabungan beberapa catatan dalam rentang waktu tertentu ke Gemini, minta 1 paragraf recap |
| Prompt starter | Statis (list pertanyaan pemantik) sudah cukup — tidak perlu API call untuk fitur kecil ini |

> Trik hemat kuota API: gabungkan sebanyak mungkin kebutuhan (transkrip + rangkuman + mood + tag) dalam **satu response JSON** dari satu API call, bukan panggilan terpisah-pisah. Ini juga bagus untuk narasi "efisiensi teknis" di penilaian Kualitas Kode.

## Yang Perlu Disiapkan untuk Bukti "Kualitas Prompting" (20% penilaian)

Ini bukan fitur di app, tapi proses kerja tim yang wajib didokumentasikan terpisah dari app itu sendiri:

1. Simpan/screenshot setiap sesi prompting penting: dari (a) prompt awal minta AI buat scaffold project, (b) prompt per fitur (rekam, transkripsi, penyimpanan, dst — lihat `08-vibecoding-prompt-guide.md`), (c) prompt debugging/perbaikan.
2. Kalau tool AI yang dipakai punya fitur "share chat" (seperti Claude), pakai itu untuk dapat link langsung — paling mudah diverifikasi panitia.
3. Kalau tidak ada fitur share, export percakapan jadi PDF/markdown dan lampirkan sebagai dokumen log.
4. Narasikan **kenapa** tiap prompt dibuat, bukan cuma isi promptnya — juri menilai *alur berpikir*, bukan cuma hasil. Contoh: "Kami mulai dengan prompt A untuk scaffold, lalu setelah melihat hasilnya kurang X, kami revisi dengan prompt B yang menambahkan constraint Y."
