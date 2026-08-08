# 06 — Data Model & Keamanan/Privasi

## Prinsip Keamanan (revisi — disederhanakan sesuai kebutuhan)

Kebutuhan sebenarnya: **sesama user tidak boleh bisa melihat catatan satu sama lain.** Ini tidak butuh enkripsi end-to-end (yang justru menambah kompleksitas signifikan tanpa manfaat besar untuk kasus ini, karena front-end tetap butuh menyimpan/mengakses kunci untuk menampilkan data — enkripsi paling berguna melawan penyedia layanan yang tidak bisa dipercaya, bukan melawan sesama user biasa).

Pendekatan yang dipakai: **Authentication + Server-side Authorization Rules**, standar industri untuk kasus ini.

- Tiap user punya `userId` unik dari Firebase Authentication (anonymous auth by default, lihat `03-tech-stack.md`).
- Tiap dokumen catatan menyimpan `userId` pemiliknya.
- **Firestore Security Rules** menolak permintaan baca/tulis dari mana pun (termasuk lewat DevTools/network inspector) kalau `userId` di data tidak cocok dengan user yang sedang login.
- Karena aturan ini ditegakkan **di sisi server Firebase**, bukan di kode front-end, user tidak bisa mengakalinya walau membuka DevTools atau mengedit kode client — ini yang membuatnya cukup kuat meski sederhana.

## A. Struktur Data (Firestore + Firebase Storage)

### Collection: `entries`

```
entries/{entryId}
├── userId: string          // wajib, dipakai Security Rules
├── createdAt: timestamp
├── updatedAt: timestamp
├── content: string          // isi catatan (hasil rangkuman, sudah diedit user)
├── transcriptRaw: string    // transkrip mentah (untuk fitur "lihat transkrip asli")
├── hasAudio: boolean
├── audioStoragePath: string | null   // path ke Firebase Storage, kalau ada
├── source: "voice" | "manual"
├── mood: string | null       // stretch
├── tags: string[]            // stretch
```

> Catatan: karena isolasi sudah dijamin lewat Security Rules + Auth, `content` & `transcriptRaw` **disimpan sebagai teks biasa** (tidak perlu dienkripsi manual). Ini jauh menyederhanakan implementasi dibanding versi sebelumnya, sekaligus tetap aman untuk requirement "tidak bisa diintip user lain".

### Firebase Storage: audio

```
audio/{userId}/{entryId}.webm
```
Struktur path yang menyertakan `userId` juga dipasangkan dengan **Storage Security Rules** senada:

```
// Firebase Storage Security Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Collection: `users/{userId}/settings` (subcollection, otomatis ter-isolasi per user)

```
users/{userId}/settings/preferences
├── frequency: "daily-1x" | "daily-2x" | "every-2-days" | "every-3-days"
├── reminderTime: string   // "HH:mm"
```

### Collection: `users/{userId}/streak`

```
users/{userId}/streak/current
├── currentStreak: number
├── longestStreak: number
├── lastEntryDate: string   // "YYYY-MM-DD"
├── graceUsedThisWeek: boolean   // stretch
```

> Menyimpan `settings` & `streak` sebagai **subcollection di bawah `users/{userId}`** (bukan collection terpisah dengan field `userId`) membuat isolasinya otomatis by-design — Security Rules cukup satu baris: `allow read, write: if request.auth.uid == userId;` di level path, tidak perlu cek field per-dokumen.

## B. Firestore Security Rules (lengkap, siap pakai)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /entries/{entryId} {
      allow read, update, delete: if request.auth != null
                                    && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
                     && request.auth.uid == request.resource.data.userId;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                           && request.auth.uid == userId;
    }
  }
}
```

**Yang perlu diuji sebelum submit lomba:** buka aplikasi dari 2 browser/device berbeda (2 akun anonymous berbeda), pastikan catatan dari akun A **tidak muncul** sama sekali di akun B, dan coba akses langsung lewat Firebase Console/DevTools untuk memverifikasi rule benar-benar menolak. Ini bisa jadi bahan demo/screenshot untuk membuktikan ke juri fitur keamanan benar-benar berfungsi, bukan cuma klaim di proposal.

## C. Local Cache (Offline-first)

| Tool | Fungsi |
|---|---|
| **IndexedDB (Dexie.js)** | Cache read-only dari Firestore untuk mempercepat load & tetap bisa dipakai offline. Sinkronisasi terjadi otomatis lewat Firestore SDK (yang memang punya offline persistence bawaan — tinggal diaktifkan, tidak perlu bangun sync logic sendiri) |

> Firebase SDK punya fitur **offline persistence** bawaan (`enableIndexedDbPersistence`) — ini menyederhanakan lagi implementasi: cukup aktifkan satu baris config, Firestore otomatis cache ke IndexedDB & sinkron ulang saat online kembali. Tidak perlu Dexie.js terpisah kalau memakai fitur ini; sebutkan sebagai opsi yang lebih simpel di tahap implementasi.

## D. Privasi Lain yang Perlu Diperhatikan

- **Tidak ada login manual wajib** — anonymous auth membuat app langsung bisa dipakai tanpa isi form, tapi tetap dapat isolasi data penuh karena Firebase tetap memberi `uid` unik per instance.
- **Reset/hapus akun:** sediakan opsi "hapus semua data saya" di Settings yang menghapus seluruh dokumen `entries` milik user + file di Storage.
- **Analytics (kalau dipasang):** jangan kirim isi catatan ke tool analytics apa pun, cukup event non-sensitif (misal "app_opened", "entry_saved" tanpa isi teksnya).
- **Trade-off yang jujur untuk proposal:** karena bukan end-to-end encryption, secara teknis pemilik project Firebase (tim sendiri, lewat akses admin Firebase Console) **bisa** melihat data mentah kalau mau — ini beda dengan enkripsi yang membuat data tidak terbaca bahkan oleh admin. Untuk kompetisi ini levelnya sudah cukup (yang diminta hanya "sesama user tidak saling intip"), tapi baik disebutkan sebagai batasan yang disadari di BAB IV (Saran Pengembangan Selanjutnya) — misalnya "pengembangan lanjut dapat menambahkan client-side encryption untuk data paling sensitif."
