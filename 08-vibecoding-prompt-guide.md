# 08 — Panduan Urutan Prompt untuk Vibe Coding

Prinsip: **jangan minta AI bikin seluruh app dalam 1 prompt raksasa.** Selain hasilnya biasanya berantakan & susah di-debug, juri menilai "narasi prompting dari awal hingga aplikasi selesai" — kalau cuma 1 prompt, tidak ada narasi untuk dinilai. Pecah jadi tahap-tahap di bawah, dan **screenshot/simpan tiap tahap**.

Setiap prompt di bawah sudah dirancang untuk ditempel langsung, tapi sesuaikan bagian `[...]` dengan keputusan tim (nama app, palet warna dari `04-design-system.md`, dll).

---

## Tahap 0 — Beri Konteks Project (sekali di awal sesi)

```
Saya sedang membangun PWA voice journaling bernama "[NAMA APP]" untuk kompetisi
BitsMikro Innovative VibeCode 2026. Ketentuan lomba: aplikasi wajib front-end
only (tanpa backend custom), wajib pakai minimal 1 teknologi AI sebagai fitur
utama, dan seluruh tech stack harus gratis.

Saya sudah menyiapkan dokumen perencanaan lengkap (project overview, daftar
fitur, tech stack, design system, user flow, data model & security, AI
integration). Saya akan bekerja dengan kamu bertahap, fitur per fitur, bukan
sekaligus. Untuk sekarang, cukup pahami konteks ini dulu — saya akan kirim
detail tiap tahap secara terpisah.

[tempel isi 01-project-overview.md]
[tempel isi 02-features.md, bagian MVP saja dulu]
[tempel isi 03-tech-stack.md]
```

## Tahap 1 — Scaffold Project

```
Buatkan scaffold project React + Vite + TypeScript + Tailwind CSS untuk app
ini, dengan setup PWA menggunakan vite-plugin-pwa (manifest.json, service
worker, ikon placeholder). Struktur folder sebaiknya memisahkan:
- components/ (UI reusable)
- features/ (per fitur: recording, entries, search, settings, streak)
- lib/ (utilities: crypto, db/dexie setup, ai)
- types/

Jangan implementasi fitur apa pun dulu, cukup scaffold + routing kosong untuk
3 tab utama: Rekam, Catatan, Tanya, + halaman Settings dan Onboarding.
```

## Tahap 2 — Design Tokens & Layout Dasar

```
[tempel isi 04-design-system.md yang sudah diisi hex value]

Terapkan token warna & tipografi di atas sebagai Tailwind config custom
(bukan warna default Tailwind). Buatkan juga komponen layout dasar: shell
navigasi 3-tab sesuai konsep "Notebook Tab" yang saya jelaskan, dan pastikan
responsive dari mobile ke desktop (PWA ini utamanya dipakai di HP).
```

## Tahap 3 — Onboarding Flow

```
[tempel bagian "Flow 1 — First-time Onboarding" dari 05-user-flow-and-ia.md]

Implementasikan flow onboarding ini sebagai 3 step dalam satu halaman
(stepper), state akhirnya disimpan ke local settings store (siapkan
struktur sesuai table `settings` di dokumen data model saya — akan saya
kirim setelah ini). Untuk sekarang simpan dulu ke React state / localStorage
sementara, nanti kita ganti ke IndexedDB di tahap database.
```

## Tahap 4 — Setup Firebase (Auth & Database)

```
[tempel isi 06-data-model-security.md]
[tempel bagian "3. Backend-as-a-Service" dari 03-tech-stack.md]

Implementasikan:
1. Setup Firebase project config (saya akan isi API key & config-nya sendiri
   dari Firebase Console).
2. Anonymous authentication yang otomatis jalan saat app pertama dibuka
   (tanpa UI login apa pun untuk sekarang).
3. Setup Firestore dengan struktur collection entries, users/{userId}/settings,
   users/{userId}/streak sesuai yang saya jelaskan.
4. Tuliskan juga Firestore Security Rules & Storage Security Rules yang
   sesuai (saya akan pasang manual di Firebase Console).
5. Aktifkan Firestore offline persistence untuk mendukung akses offline ke
   data yang sudah tersimpan.
6. Migrasikan data onboarding dari localStorage ke Firestore
   (users/{userId}/settings).

Setelah ini selesai, saya akan minta kamu implementasi fitur rekam suara.
```

## Tahap 5 — Rekam Suara & Waveform

```
Implementasikan fitur rekam audio di halaman Rekam:
1. Gunakan MediaRecorder API untuk merekam dari mic.
2. Tampilkan visualizer waveform real-time menggunakan AudioContext +
   AnalyserNode selama proses rekam (sesuai signature element di design
   system: waveform, bukan ikon generic).
3. State: idle → recording → stopped (audio blob siap diproses).
4. Handle kasus user menolak izin mic dengan pesan jelas + arahkan ke
   opsi "tulis manual".

Belum perlu integrasi AI dulu di tahap ini — cukup sampai audio blob
dihasilkan dan bisa diputar ulang untuk verifikasi.
```

## Tahap 6 — Integrasi AI: Transkripsi & Rangkuman via Gemini API

```
[tempel bagian "1 & 2. Transkripsi + Rangkuman" dari 07-ai-integration.md]

Implementasikan pipeline berikut setelah audio blob dihasilkan:
1. Encode audio blob ke base64.
2. Kirim ke Gemini API (model multimodal) dengan system instruction yang
   saya berikan di atas, minta response dalam format JSON
   { transcript_raw, summary }. Simpan API key di environment variable
   (.env), jangan hardcode di kode.
3. Tampilkan loading state yang jelas selama proses (misal "AI sedang
   mendengarkan & merapikan catatanmu...").
4. Parse response JSON, tampilkan `summary` di layar Review dalam textarea
   yang bisa diedit langsung, dengan opsi collapsible untuk lihat
   `transcript_raw`.
5. Handle error dengan baik: kalau API gagal/timeout, tampilkan pesan jelas
   + tombol "coba lagi", jangan biarkan audio yang sudah direkam hilang.
```

## Tahap 7 — Simpan Catatan ke Firestore

```
Sambungkan hasil dari Tahap 6 ke Firebase dari Tahap 4:
1. Setelah user tekan "Simpan", tampilkan modal konfirmasi: simpan audio
   asli atau tidak.
2. Simpan dokumen catatan ke collection `entries` dengan field userId dari
   auth.currentUser.uid, sesuai struktur di 06-data-model-security.md.
3. Kalau user pilih simpan audio, upload blob ke Firebase Storage di path
   audio/{userId}/{entryId}.webm, simpan path-nya ke field
   audioStoragePath; kalau tidak, buang blob dari memory tanpa upload.
4. Update dokumen users/{userId}/streak/current sesuai logika: [tempel
   bagian streak dari 02-features.md].
5. Redirect ke Home dengan micro-animation update streak.
```

## Tahap 8 — Tampilan Catatan (List, Kalender, Search)

```
[tempel bagian C "Melihat & Menjelajah Catatan" dari 02-features.md]
[tempel wireframe tampilan Catatan dari 04-design-system.md]

Implementasikan halaman Catatan dengan:
1. Toggle List view / Calendar view.
2. List view: kartu catatan terurut terbaru, dekripsi on-the-fly saat
   render, preview 2-3 baris.
3. Calendar view: kalender bulanan dengan dot penanda tanggal berisi
   catatan, klik tanggal untuk filter list ke tanggal tersebut.
4. Search bar kata kunci dengan highlight hasil, filter real-time.
5. Halaman Detail Catatan: full text (editable), audio player kalau ada,
   tombol edit/hapus.
```

## Tahap 9 — Reminder Notifikasi

```
Implementasikan reminder berbasis Notification API + Service Worker:
1. Minta izin notifikasi (idealnya di onboarding atau saat user pertama
   set reminder time).
2. Jadwalkan notifikasi lokal sesuai frequency & reminderTime dari
   settings — dihitung ulang tiap kali app dibuka.
3. Tap notifikasi membuka app langsung ke halaman Rekam.
```

## Tahap 10 (Stretch) — AI Tanya Jurnal

```
[tempel bagian "3. Semantic Search / AI Tanya Jurnal" dari 07-ai-integration.md]
[tempel "Flow 5" dari 05-user-flow-and-ia.md]

Implementasikan halaman Tanya:
1. Query Firestore untuk ambil catatan kandidat (misal N catatan terbaru,
   atau filter keyword sederhana kalau data sudah banyak).
2. Kirim kandidat catatan (tanggal + content) + pertanyaan user ke Gemini
   API dengan system prompt anti-halusinasi yang saya berikan.
3. Tampilkan jawaban + daftar catatan sumber (dengan tanggal) yang bisa
   diklik untuk membuka Detail Catatan aslinya.
4. Kalau tidak ada catatan relevan ditemukan, tampilkan jawaban jujur
   sesuai instruksi di system prompt, jangan biarkan AI mengarang.
```

## Tahap 11 — Polish & Fitur Stretch Lain

```
Sekarang saya ingin polish di area berikut (pilih sesuai waktu tersisa,
cek 02-features.md bagian Stretch):
- [ ] Grace day untuk streak
- [ ] Mood tag & auto-tagging
- [ ] Ringkasan mingguan
- [ ] Export/import data terenkripsi
- [ ] Dark mode
- [ ] Empty states & error states yang lebih baik
- [ ] Animasi micro-interaction sesuai prinsip motion di design system

Untuk masing-masing, saya akan kirim prompt terpisah supaya mudah ditelusuri.
```

## Tahap 12 — Review Kode & Testing

```
Tolong review keseluruhan kode yang sudah kita buat untuk:
1. Konsistensi penggunaan TypeScript types.
2. Potensi memory leak (terutama di audio recording & AI model loading).
3. Aksesibilitas dasar (keyboard navigation, aria-label, focus visible).
4. Responsiveness di ukuran layar kecil.
5. Error handling di semua async operation (AI processing, IndexedDB,
   mic permission).
```

---

## Tips tambahan

- Setelah tiap tahap, **jalankan & screenshot hasilnya**, catat singkat: apa yang berhasil, apa yang perlu di-fix di prompt berikutnya. Ini jadi bahan narasi "Kualitas Prompting" & juga bahan poin "Tantangan & Solusi Selama Pengembangan" di pitching.
- Kalau AI menghasilkan kode yang terlalu generic/keluar dari design system, langsung koreksi di prompt berikutnya dengan merujuk balik ke `04-design-system.md` — jangan biarkan lolos, karena ini yang membedakan hasil dari "AI slop" biasa.
- Simpan semua dokumen di `voicejournal-docs/` ini juga sebagai bagian dari repository (misal di folder `docs/`) — selain jadi acuan tim, juga memperkuat kesan proyek dikerjakan dengan perencanaan matang saat dinilai "Kesesuaian dengan Proposal".
