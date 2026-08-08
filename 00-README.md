# Voice Journal PWA — Dokumen Perencanaan (BitsMikro Innovative VibeCode 2026)

Folder ini berisi seluruh dokumen perencanaan sebelum mulai *vibe coding*. Tujuannya: begitu kamu buka Claude/AI tools lain untuk mulai ngoding, kamu tinggal salin-tempel bagian yang relevan dari dokumen ini sebagai prompt, bukan mikir dari nol. Ini juga akan langsung menaikkan nilai **"Kualitas Prompting" (20%)** karena alur prompting kamu jadi terstruktur dan bisa ditelusuri dari perencanaan → implementasi.

## Daftar Dokumen

| File | Isi | Dipakai untuk BAB Proposal |
|---|---|---|
| `01-project-overview.md` | Latar belakang, masalah, tujuan, manfaat, deskripsi project | BAB I & BAB II |
| `02-features.md` | Semua fitur (fitur kamu + usulan tambahan), diprioritaskan (MVP vs stretch) | BAB II.5, II.6, BAB III.5 |
| `03-tech-stack.md` | Stack 100% gratis, alasan pemilihan tiap tool | BAB III.6 |
| `04-design-system.md` | Kerangka design system (token kosong, tinggal isi hex) | BAB III.4 |
| `05-user-flow-and-ia.md` | User flow, information architecture, wireframe kasar (ASCII) | BAB III.2, III.4 |
| `06-data-model-security.md` | Struktur data, strategi keamanan & privasi | BAB III.1, III.3 |
| `07-ai-integration.md` | Detail teknis integrasi AI (peran AI, arsitektur AI di app) | BAB III.3, materi pitching poin 5 |
| `08-vibecoding-prompt-guide.md` | Urutan prompt siap pakai untuk membangun app dari nol | Log prompting (Lampiran no.5) |

## Cara pakai yang disarankan

1. Baca `01` → `06` dulu sebagai tim, sepakati scope MVP di `02-features.md`.
2. Isi warna di `04-design-system.md` (satu-satunya bagian yang sengaja dikosongkan).
3. Buka tool vibe coding (Claude, dsb.), ikuti urutan di `08-vibecoding-prompt-guide.md` — **jangan minta AI generate seluruh app dalam satu prompt**, karena juri menilai *narasi* prompting-nya, bukan cuma hasil akhirnya.
4. Simpan/screenshot/export seluruh percakapan prompting dari awal sampai akhir → ini jadi Lampiran "Link Prompting AI".
5. Setelah app jadi, deploy (Vercel/Netlify/Cloudflare Pages — gratis), lalu rekam video demo.

## Catatan penting soal aturan lomba

- **Front-End only** artinya backend custom (server sendiri yang dikelola tim) **tidak dinilai sebagai nilai tambah** — bukan berarti dilarang total. Karena itu rancangan ini memakai **Backend-as-a-Service (Firebase)** untuk auth & database, serta **Gemini API** untuk AI — keduanya dipanggil langsung dari kode front-end, tim tidak menulis kode server sama sekali. Ini dipilih supaya (1) AI membaca/memahami audio lebih akurat dibanding model kecil yang jalan di browser, dan (2) isolasi data antar-user bisa diandalkan lewat Security Rules tanpa perlu enkripsi yang rumit. Detail lengkap & alasannya di `03-tech-stack.md`.
- **Wajib pakai AI sebagai fitur utama**, bukan sekadar tempelan. Di rancangan ini AI dipakai di 2 titik inti: (1) audio → transkrip + rangkuman terstruktur dalam satu panggilan Gemini API, (2) AI-powered search/tanya-jawab atas isi jurnal. Detail di `07-ai-integration.md`.
- **Keamanan data:** cukup memastikan sesama user tidak bisa saling melihat catatan (bukan end-to-end encryption) — dicapai lewat Firebase Authentication + Firestore Security Rules. Detail di `06-data-model-security.md`.
- **Log prompting harus bisa diakses panitia.** Simpan link share-chat (kalau tool-nya support) atau export percakapan jadi PDF/markdown sebagai gantinya.
