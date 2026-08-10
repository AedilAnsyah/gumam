# 📐 Diagram Arsitektur & Alur Kerja Sistem — Gumam PWA

> **Aplikasi:** Gumam (Voice Journaling PWA Berbasis AI)  
> **Kompetisi:** BitsMikro Innovative VibeCode 2026  
> **Tim Pengembang:** Tim Calon Manajer Kopdes  

Dokumen ini berisi kode **Mermaid** resmi untuk **Arsitektur Sistem** dan **Alur Kerja Sistem** aplikasi Gumam.

---

## 🏗️ 1. Diagram Arsitektur Sistem (System Architecture)

Diagram berikut menggambarkan komponen-komponent utama arsitektur aplikasi **Gumam**, mulai dari *Client Layer (PWA)*, *Local Storage & Cache*, *Firebase BaaS*, hingga *Google Gemini AI Service*.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Browser / PWA)"]
        UI["UI Layer (React 18 + Tailwind CSS + Lucide Icons)"]
        
        subgraph SubModules ["Fitur & Modul Utama"]
            RecStudio["Studio Rekaman (RecordPage)"]
            EntriesModule["Daftar & Kalender Catatan (EntriesPage)"]
            SearchAskModule["Tanya AI / Semantic Search (SearchAskPage)"]
            SettingsModule["Setelan & Ekspor/Impor (SettingsPage)"]
        end

        subgraph PWACapabilities ["Fitur Native PWA & Web API"]
            MediaRec["MediaRecorder API"]
            AudioCtx["AudioContext & AnalyserNode (Visualizer)"]
            SW["Service Worker (sw.js & Workbox)"]
            NotifAPI["Web Notification API"]
        end

        subgraph LocalData ["Penyimpanan Lokal (Client-Side Cache)"]
            LS["LocalStorage (Preferensi & Status Onboarding)"]
            IdxDB["Firestore Persistent Local Cache (IndexedDB)"]
        end
      end

    subgraph FirebaseBaaS ["Firebase Backend-as-a-Service (BaaS)"]
        FBAuth["Firebase Anonymous Authentication"]
        FirestoreDB[("Cloud Firestore DB")]
        FBStorage[("Firebase Storage (File Audio WebM/MP4)")]
        SecRules["Firestore & Storage Security Rules"]
    end

    subgraph ExternalAIService ["Google Generative AI Service"]
        GeminiAPI["Google Gemini 2.5 Flash API (REST Endpoint)"]
    end

    %% Relasi Komponen Client
    UI --> SubModules
    RecStudio --> MediaRec
    RecStudio --> AudioCtx
    SettingsModule --> NotifAPI
    SW --> NotifAPI

    %% Relasi Client ke Local Storage
    SubModules --> LS
    SubModules --> IdxDB

    %% Relasi Client ke Firebase BaaS
    UI --> FBAuth
    IdxDB <--> SecRules
    SecRules <--> FirestoreDB
    RecStudio --> FBStorage

    %% Relasi Client ke Gemini AI API
    RecStudio -- "Post Multimodal Audio (Base64)" --> GeminiAPI
    SearchAskModule -- "Post Q&A Prompt + Context Catatan" --> GeminiAPI
    EntriesModule -- "Post Context Catatan Mingguan" --> GeminiAPI
    GeminiAPI -- "Return Response JSON" --> SubModules
```

---

## 🔄 2. Diagram Alur Kerja Sistem (System Workflows)

### 🎙️ A. Alur Kerja Rekam Suara & Pengolahan AI Gemini (Voice Processing Pipeline)

Alur berikut menjelaskan tahapan pengguna mengambil rekaman suara hingga diproses oleh **Gemini 2.5 Flash API** dan disimpan ke **Firestore & Firebase Storage**.

```mermaid
flowchart TD
    Start([Pengguna Menekan Tombol Rekam]) --> CheckMic{Izin Mikrofon Granted?}
    
    CheckMic -- Tidak / Ditolak --> ErrMic[Tampilkan Warning & Pilihan Tulis Manual]
    ErrMic --> ManualInput[Pengguna Mengetik Catatan Manual]
    
    CheckMic -- Ya / Diizinkan --> StartStream[Aktifkan Audio Stream & AudioContext]
    StartStream --> VisWave[Render Real-time Waveform Canvas]
    VisWave --> RecordActive[Merekam Audio...]
    RecordActive --> StopClick[Pengguna Menekan Berhenti]
    
    StopClick --> GenerateBlob[Buat Audio Blob WebM/MP4 & URL Preview]
    GenerateBlob --> UserChoice{Tindakan Pengguna}
    
    UserChoice -- Rekam Ulang --> Reset[Reset State Audio] --> Start
    UserChoice -- Tekan Proses AI --> ConvertBase64[Konversi Audio Blob ke Base64]
    
    ConvertBase64 --> CallGemini[Kirim Request ke Gemini 2.5 Flash REST API]
    CallGemini --> ReceiveJSON[Gemini Mengembalikan Output JSON:<br/>Transcript, Summary, Mood, Tags]
    
    ReceiveJSON --> ReviewScreen[Tampilkan Halaman Review & Edit Rangkuman]
    ReviewScreen --> UserSave[Pengguna Menekan Simpan Catatan]
    
    UserSave --> ModalAudio{Pilihan Simpan Audio?}
    ModalAudio -- Ya --> UploadStorage[Upload File Audio ke Firebase Storage]
    ModalAudio -- Tidak --> SkipStorage[Abaikan Upload Audio]
    
    UploadStorage --> SaveFirestore[Simpan Document ke Firestore Collection 'entries']
    SkipStorage --> SaveFirestore
    ManualInput --> SaveFirestore
    
    SaveFirestore --> UpdateStreak[Kalkulasi Streak Harian + Logika Grace Day]
    UpdateStreak --> ShowToast[Tampilkan Toast Streak Fire 🔥]
    ShowToast --> RedirectEntries[Navigasi Otomatis ke /entries]
    RedirectEntries --> Finish([Selesai])
```

---

### 🔍 B. Alur Kerja AI Tanya Jurnal (Semantic Natural Language Search / RAG)

Alur berikut menjelaskan alur pencarian memori natural language (*Retrieval-Augmented Generation / RAG*) di mana AI mencari jawaban dari catatan pengguna tanpa mengarang fakta.

```mermaid
flowchart TD
    StartAsk([Pengguna Membuka Tab Tanya AI]) --> InputQ[Pengguna Memasukkan Pertanyaan / Klik Suggestion Chip]
    InputQ --> FetchEntries[Ambil Riwayat Catatan Pengguna dari Firestore / Local Cache]
    
    FetchEntries --> BuildContext[Susun Prompt Context: ID, Tanggal, Isi Catatan, & Tags]
    BuildContext --> SendGeminiAsk[Kirim Prompt + Context ke Gemini 2.5 Flash API]
    
    SendGeminiAsk --> ProcessAI[Gemini Menganalisis Catatan vs Pertanyaan]
    ProcessAI --> ReturnJSON[Gemini Mengembalikan JSON:<br/>answer, referencedEntryIds, found]
    
    ReturnJSON --> CheckFound{Apakah Informasi Ditemukan?}
    
    CheckFound -- Ya --> RenderAnswerCard[Tampilkan Kartu Jawaban AI]
    RenderAnswerCard --> RenderCitations[Render Pill Link Referensi Sumber /entries/:id]
    
    CheckFound -- Tidak / Honest Fallback --> RenderFallback[Tampilkan Jawaban Jujur:<br/>Informasi tidak ditemukan di jurnal]
    
    RenderCitations --> ClickCitation[User Klik Link Referensi]
    ClickCitation --> GoDetail[Navigasi ke Entry Detail Page]
    RenderFallback --> EndAsk([Selesai])
    GoDetail --> EndAsk
```

---

### 🔔 C. Alur Kerja Penjadwalan Reminder Notifikasi PWA

Alur berikut menjelaskan bagaimana pengingat lokal dijadwalkan dan dipicu oleh **Service Worker** & **Web Notification API**.

```mermaid
flowchart TD
    StartNotif([Aplikasi Gumam Dibuka]) --> CheckPermission{Status Izin Notifikasi?}
    
    CheckPermission -- Undetermined / Prompt --> RequestNotif[Tampilkan Prompt Request Permission]
    RequestNotif --> UserNotifAns{User Menyetujui?}
    UserNotifAns -- Tidak --> DisableNotif[Notifikasi Dikonfigurasi Nonaktif]
    UserNotifAns -- Ya --> SaveGranted[Set status Notification Granted]
    
    CheckPermission -- Denied --> DisableNotif
    CheckPermission -- Granted --> SaveGranted
    
    SaveGranted --> ReadTime[Baca Setelan reminderTime dari LocalStorage]
    ReadTime --> CalcTimer[Kalkulasi Selisih Waktu Target vs Jam Sekarang]
    
    CalcTimer --> ScheduleTimer[Jadwalkan setTimeout Local / Service Worker Sync]
    ScheduleTimer --> WaitTime[Menunggu Waktu Reminder Tiba...]
    
    WaitTime --> TriggerNotif[Waktu Tiba: Picu Notification API]
    TriggerNotif --> ShowBanner[Tampilkan Banner Push Notification di HP/Desktop]
    ShowBanner --> ClickBanner[User Ketuk Notifikasi]
    ClickBanner --> OpenApp[Buka Aplikasi Gumam / Studio Rekam]
    OpenApp --> EndNotif([Selesai])
```

---

## 📌 Kesimpulan Arsitektur

Arsitektur aplikasi **Gumam** mengusung prinsip **Hybrid Progressive Web App (PWA)**:
1. **Client-Side Heavy**: Seluruh UI, perekaman audio, visualisasi gelombang suara, dan komunikasi API berjalan langsung di browser pengguna.
2. **Serverless BaaS**: Menggunakan Firebase untuk autentikasi anonim, Firestore dengan *offline persistence*, dan Firebase Storage.
3. **Multimodal AI Integration**: Memanfaatkan keunggulan Google Gemini 2.5 Flash API yang mampu membaca berkas audio mentah dan memproses teks secara cepat & hemat energi.

---
*Dokumen ini dibuat oleh Tim Calon Manajer Kopdes untuk Kompetisi BitsMikro Innovative VibeCode 2026.*
