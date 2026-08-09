import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Smile,
  Tag,
  ChevronDown,
  ChevronUp,
  Flame,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { AudioWaveformVisualizer } from '../../components/AudioWaveformVisualizer';
import { WaveformDecoration } from '../../components/WaveformDecoration';
import { summarizeAudioWithGemini, GeminiProcessResult } from '../../lib/ai';
import { saveJournalEntry } from '../../lib/entries';
import { ROUTES } from '../../lib/constants';
import { DEMO_AI_RESULT, PROMPT_STARTERS } from '../../lib/sampleData';

type RecordState = 
  | 'idle' 
  | 'recording' 
  | 'stopped' 
  | 'processing' 
  | 'review' 
  | 'manual' 
  | 'permission_denied';

export const RecordPage: React.FC = () => {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hasil AI & Edit Manual
  const [aiResult, setAiResult] = useState<GeminiProcessResult | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [manualText, setManualText] = useState('');

  // Loading State
  const [isSaving, setIsSaving] = useState(false);
  const [streakSuccessToast, setStreakSuccessToast] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [mediaStream, audioUrl]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm') && MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordState('stopped');

        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      mediaRecorder.start(200);
      setRecordState('recording');
      setRecordingDuration(0);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 50, 30]);
        } catch {
          // Ignored
        }
      }

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone Permission/Device Error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Akses mikrofon ditolak. Kamu bisa mengaktifkan izin mic di browser atau beralih ke tulis manual.');
        setRecordState('permission_denied');
      } else {
        setErrorMessage('Mikrofon tidak terdeteksi atau tidak didukung pada perangkat ini.');
        setRecordState('permission_denied');
      }
    }
  };

  const stopRecording = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignored
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleProcessAI = async () => {
    if (!audioBlob) return;

    setRecordState('processing');
    setErrorMessage(null);

    try {
      const result = await summarizeAudioWithGemini(audioBlob);
      setAiResult(result);
      setEditedSummary(result.summary);
      setRecordState('review');
    } catch (err: any) {
      console.error('Gemini AI Process Error:', err);
      if (err.message?.includes('Google Gemini API Key belum diset')) {
        const demoResult = DEMO_AI_RESULT;
        setAiResult(demoResult);
        setEditedSummary(demoResult.summary);
        setRecordState('review');
      } else {
        setErrorMessage(err.message || 'Gagal memproses audio dengan AI. Silakan coba lagi.');
        setRecordState('stopped');
      }
    }
  };

  const handleInitiateSave = () => {
    // Audio tidak disimpan — langsung simpan teks ke Firestore tanpa modal
    executeSave();
  };

  const executeSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const content = recordState === 'manual' ? manualText : editedSummary;
      const source = recordState === 'manual' ? 'manual' : 'voice';

      // Audio tidak diteruskan ke sini — blob sudah dikirim ke Gemini API
      // di step sebelumnya dan tidak perlu disimpan ke Storage
      await saveJournalEntry({
        content,
        transcriptRaw: aiResult?.transcriptRaw,
        source,
        mood: aiResult?.mood,
        tags: aiResult?.tags,
      });

      setIsSaving(false);
      setStreakSuccessToast(true);

      setTimeout(() => {
        handleReset();
        navigate(ROUTES.ENTRIES);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving journal entry:', err);
      setIsSaving(false);
      setErrorMessage(err.message || 'Gagal menyimpan catatan ke Firestore.');
    }
  };

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAiResult(null);
    setEditedSummary('');
    setManualText('');
    setRecordingDuration(0);
    setIsPlayingPreview(false);
    setErrorMessage(null);
    setRecordState('idle');
  };

  const togglePlayPreview = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="w-full pb-20 md:pb-8 relative">
      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onEnded={() => setIsPlayingPreview(false)}
          className="hidden"
        />
      )}

      {/* Toast Notification Streak Success */}
      {streakSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 neu-raised bg-surface text-ink px-6 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-bold animate-bounce border border-white/50 dark:border-white/10">
          <div className="w-8 h-8 rounded-full neu-inset-sm flex items-center justify-center text-warning">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <span>Catatan Tersimpan! Streak Bertambah 🔥</span>
        </div>
      )}

      {/* Layout Grid Responsif: Mobile 1 Kolom, Desktop 2 Kolom (7:5) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri / Utama (Neumorphic Studio Recorder) */}
        <div className="md:col-span-7 flex flex-col items-center justify-between min-h-[480px] neu-card p-6 md:p-8 text-center relative overflow-hidden">
          
          {/* Header Prompt */}
          <div className="space-y-2 max-w-sm">
            {recordState === 'recording' ? (
              <>
                <div className="inline-flex items-center gap-2 neu-inset-sm text-danger px-4 py-1.5 rounded-full text-xs font-mono font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
                  <span>MEREKAM AUDIO ({formatTimer(recordingDuration)})</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight pt-1">
                  Silakan Bicara...
                </h2>
                <p className="text-xs text-ink-muted">
                  Bicarakan ceritamu secara alami. AI akan merapikan kata-katamu.
                </p>
              </>
            ) : recordState === 'processing' ? (
              <>
                <div className="inline-flex items-center gap-2 neu-inset-sm text-accent px-4 py-1.5 rounded-full text-xs font-mono font-bold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GEMINI AI ENGINE</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight pt-1">
                  AI Mendengarkan Catatanmu...
                </h2>
                <p className="text-xs text-ink-muted">
                  Sedang mentranskrip ucapan dan merapikan catatan harianmu.
                </p>
              </>
            ) : recordState === 'review' ? (
              <>
                <div className="inline-flex items-center gap-1.5 neu-inset-sm text-success px-4 py-1.5 rounded-full text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RANGKUMAN AI SIAP</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight pt-1">
                  Periksa & Edit Catatan
                </h2>
                <p className="text-xs text-ink-muted">
                  Kamu bisa mengoreksi rangkuman di bawah sebelum disimpan.
                </p>
              </>
            ) : recordState === 'stopped' ? (
              <>
                <div className="inline-flex items-center gap-1.5 neu-inset-sm text-accent px-4 py-1.5 rounded-full text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REKAMAN SELESAI ({formatTimer(recordingDuration)})</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight pt-1">
                  Pratinjau Suara
                </h2>
                <p className="text-xs text-ink-muted">
                  Dengarkan ulang rekamanmu atau tekan Proses AI.
                </p>
              </>
            ) : recordState === 'manual' ? (
              <>
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  Tulis Catatan Manual
                </h2>
                <p className="text-xs text-ink-muted">
                  Ketik cerita harianmu langsung jika sedang tidak nyaman berbicara.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
                  Apa yang sedang kamu pikirkan?
                </h2>
                <p className="text-xs text-ink-muted">
                  Bicara saja secara alami, AI akan merapikan cerita jurnalmu.
                </p>
              </>
            )}
          </div>

          {/* Interactive Recording Core */}
          <div className="relative flex flex-col items-center justify-center my-6 w-full max-w-sm">
            {errorMessage && recordState !== 'permission_denied' && (
              <div className="neu-inset-sm text-danger p-3.5 rounded-2xl mb-4 text-xs flex items-center gap-2 text-left w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSaving && (
              <div className="neu-card p-8 w-full flex flex-col items-center space-y-4 shadow-2xl z-30">
                <div className="w-16 h-16 rounded-full neu-inset flex items-center justify-center text-accent">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="text-sm font-bold text-ink">Menyimpan ke Firestore...</div>
                <p className="text-xs text-ink-muted">Mengamankan catatan & meng-update streak</p>
              </div>
            )}

            {/* IDLE STATE: Concentric Neumorphic Dial Button */}
            {!isSaving && recordState === 'idle' && (
              <div className="flex flex-col items-center space-y-6">
                {/* Outer Beveled Ring */}
                <div className="w-48 h-48 rounded-full neu-raised flex items-center justify-center p-3 transition-all duration-300">
                  {/* Middle Recessed Ring */}
                  <div className="w-full h-full rounded-full neu-inset-sm flex items-center justify-center p-3">
                    {/* Inner Action Button */}
                    <button
                      onClick={startRecording}
                      aria-label="Mulai Merekam Suara"
                      className="group w-full h-full rounded-full neu-raised bg-surface text-accent hover:neu-inset active:neu-inset transition-all duration-200 flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full neu-raised-sm group-hover:neu-inset-sm flex items-center justify-center mb-1 text-accent transition-all">
                        <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                        Rekam
                      </span>
                    </button>
                  </div>
                </div>
                <span className="text-xs font-mono text-ink-muted">
                  Ketuk tombol untuk mulai rekam
                </span>
              </div>
            )}

            {/* RECORDING STATE: Sunken Inset Bay & Waveform */}
            {!isSaving && recordState === 'recording' && (
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="neu-groove p-6 w-full flex flex-col items-center">
                  <AudioWaveformVisualizer mediaStream={mediaStream} isRecording={true} />
                  <div className="mt-3 neu-pill px-4 py-1 text-xl font-mono font-bold text-accent">
                    {formatTimer(recordingDuration)}
                  </div>
                </div>

                <button
                  onClick={stopRecording}
                  aria-label="Berhenti Merekam"
                  className="neu-button px-8 py-4 rounded-2xl text-danger font-bold flex items-center gap-2.5 text-sm tracking-tight cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Selesai Bicara</span>
                </button>
              </div>
            )}

            {/* STOPPED STATE: Tactile Audio Preview Box */}
            {!isSaving && recordState === 'stopped' && (
              <div className="neu-card-sm p-6 w-full space-y-5">
                <div className="neu-inset rounded-2xl p-4 flex items-center gap-3">
                  <button
                    onClick={togglePlayPreview}
                    className="w-12 h-12 rounded-full neu-raised hover:neu-inset active:neu-inset text-accent flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-mono font-semibold text-ink">
                      Audio Rekaman Tersimpan
                    </div>
                    <div className="text-[11px] font-mono text-ink-muted mt-0.5">
                      Durasi: {formatTimer(recordingDuration)} • {audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 neu-button text-ink-muted hover:text-ink text-xs font-semibold py-3.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rekam Ulang</span>
                  </button>

                  <button
                    onClick={handleProcessAI}
                    className="flex-1 neu-button text-accent font-bold text-xs py-3.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Proses AI</span>
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING STATE */}
            {!isSaving && recordState === 'processing' && (
              <div className="neu-groove p-8 w-full flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full neu-raised flex items-center justify-center text-accent relative">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <Sparkles className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <WaveformDecoration bars={14} active={true} className="h-6" />
                <div className="space-y-1 text-center">
                  <div className="text-sm font-semibold text-ink">Merapikan Catatan...</div>
                  <div className="text-xs text-ink-muted font-mono">Gemini 2.5 Flash Engine</div>
                </div>
              </div>
            )}

            {/* REVIEW STATE: Neumorphic AI Review Card */}
            {!isSaving && recordState === 'review' && (
              <div className="neu-card-sm p-5 w-full space-y-4 text-left">
                <div className="neu-inset-sm rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPreview}
                      className="w-8 h-8 rounded-full neu-raised text-accent flex items-center justify-center cursor-pointer"
                    >
                      {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <span className="text-ink font-semibold">Audio Original</span>
                  </div>
                  <span className="text-ink-muted">{formatTimer(recordingDuration)}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                    Rangkuman AI (Dapat Diedit):
                  </label>
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={5}
                    className="w-full neu-inset rounded-2xl p-3.5 text-sm text-ink leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent resize-none"
                  />
                </div>

                {aiResult && (
                  <div className="flex items-center justify-between text-xs border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Smile className="w-3.5 h-3.5 text-accent" />
                      <span>Mood: <strong className="text-ink font-semibold">{aiResult.mood || 'Netral'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      {aiResult.tags?.map((t, idx) => (
                        <span key={idx} className="neu-pill px-2.5 py-0.5 text-accent font-mono text-[10px] font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult?.transcriptRaw && (
                  <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="flex items-center justify-between w-full text-xs font-mono text-ink-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      <span>Lihat Transkrip Mentah</span>
                      {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showTranscript && (
                      <p className="mt-2 text-xs font-mono text-ink-muted neu-inset p-3.5 rounded-2xl leading-relaxed">
                        "{aiResult.transcriptRaw}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 neu-button text-ink-muted hover:text-ink text-xs font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleInitiateSave}
                    className="flex-1 neu-button text-accent font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
              </div>
            )}

            {/* MANUAL STATE */}
            {!isSaving && recordState === 'manual' && (
              <div className="neu-card-sm p-5 w-full space-y-4 text-left">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Tuliskan harimu secara rinci di sini..."
                  rows={6}
                  className="w-full neu-inset rounded-2xl p-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setRecordState('idle')}
                    className="text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer font-mono"
                  >
                    ← Kembali ke Rekam Suara
                  </button>
                  <button
                    disabled={!manualText.trim()}
                    onClick={handleInitiateSave}
                    className="neu-button disabled:opacity-50 text-accent text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Simpan Catatan</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PERMISSION DENIED STATE */}
            {!isSaving && recordState === 'permission_denied' && (
              <div className="neu-card-sm p-6 w-full text-left space-y-3">
                <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Akses Mikrofon Diperlukan</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => setRecordState('manual')}
                    className="w-full neu-button text-accent text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Beralih ke Tulis Manual</span>
                  </button>
                  <button
                    onClick={() => setRecordState('idle')}
                    className="w-full text-xs text-ink-muted hover:text-ink py-2 cursor-pointer text-center font-mono"
                  >
                    Coba Merekam Lagi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Alternative Manual Toggle Button */}
          {recordState === 'idle' && (
            <div className="pt-2">
              <button
                onClick={() => setRecordState('manual')}
                className="neu-pill px-5 py-2 text-xs font-mono text-accent hover:neu-inset-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tulis manual sebagai gantinya</span>
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Desktop Studio Guide & Prompt Starters (Tampil khusus di Desktop) */}
        <div className="hidden md:flex md:col-span-5 flex-col space-y-6">
          {/* Card 1: Prompt Starters */}
          <div className="neu-card p-6 space-y-4 text-left">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <span>Bingung Mulai Bicara?</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Pilih salah satu topik di bawah sebagai pemantik tulisan jurnalmu hari ini:
            </p>
            <div className="space-y-2.5">
              {PROMPT_STARTERS.map((starter, idx) => (
                <div
                  key={idx}
                  className="p-3.5 neu-inset-sm rounded-2xl text-xs text-ink leading-relaxed hover:neu-inset transition-all"
                >
                  "{starter}"
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Gemini Specs */}
          <div className="neu-card p-6 space-y-3 text-left">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span>Cara Kerja Voice AI</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Google Gemini 2.5 Flash mendengar audio rekamanmu secara langsung, merapikan kata-kata pengisi ('eee', 'anu'), dan mempertahankan seluruh detail angka & tanggal tanpa mengubah fakta.
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-accent">
              <span className="neu-pill px-3 py-1">Client-Side Multimodal</span>
              <span className="neu-pill px-3 py-1">Firestore Isolated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
