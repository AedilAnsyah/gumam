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
  Volume2,
  VolumeX,
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

  // Modal Simpan & Loading State
  const [showSaveModal, setShowSaveModal] = useState(false);
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
    if (recordState === 'review' && audioBlob) {
      setShowSaveModal(true);
    } else {
      executeSave(false);
    }
  };

  const executeSave = async (saveAudio: boolean) => {
    setShowSaveModal(false);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const content = recordState === 'manual' ? manualText : editedSummary;
      const source = recordState === 'manual' ? 'manual' : 'voice';

      await saveJournalEntry({
        content,
        transcriptRaw: aiResult?.transcriptRaw,
        audioBlob: saveAudio ? audioBlob : null,
        saveAudio,
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
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-accent text-canvas px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce">
          <Flame className="w-5 h-5 fill-current text-warning" />
          <span>Catatan Tersimpan! Streak Bertambah 🔥</span>
        </div>
      )}

      {/* Layout Grid Responsif: Mobile 1 Kolom, Desktop 2 Kolom (7:5) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri / Utama (Mic Studio Recorder) */}
        <div className="md:col-span-7 flex flex-col items-center justify-between min-h-[460px] bg-surface/50 border border-surface-alt rounded-3xl p-6 md:p-8 shadow-xl text-center">
          {/* Header Prompt */}
          <div className="space-y-2 max-w-xs animate-fadeIn">
            {recordState === 'recording' ? (
              <>
                <div className="inline-flex items-center gap-2 bg-danger/15 border border-danger/30 text-danger px-3.5 py-1 rounded-full text-xs font-mono font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  <span>MEREKAM AUDIO ({formatTimer(recordingDuration)})</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
                  Silakan Bicara...
                </h2>
                <p className="text-xs text-ink-muted">
                  Bicarakan ceritamu secara alami. AI akan merapikan kata-katamu.
                </p>
              </>
            ) : recordState === 'processing' ? (
              <>
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-mono font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GEMINI AI PROCESSING</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  AI Mendengarkan Catatanmu...
                </h2>
                <p className="text-xs text-ink-muted">
                  Sedang mentranskrip ucapan dan merapikan catatan harianmu.
                </p>
              </>
            ) : recordState === 'review' ? (
              <>
                <div className="inline-flex items-center gap-1 text-success text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RANGKUMAN AI SIAP</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Periksa & Edit Catatan
                </h2>
                <p className="text-xs text-ink-muted">
                  Kamu bisa mengoreksi rangkuman di bawah sebelum disimpan.
                </p>
              </>
            ) : recordState === 'stopped' ? (
              <>
                <div className="inline-flex items-center gap-1 text-accent text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REKAMAN SELESAI ({formatTimer(recordingDuration)})</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Pratinjau Suara
                </h2>
                <p className="text-xs text-ink-muted">
                  Dengarkan ulang rekamanmu atau tekan Proses AI.
                </p>
              </>
            ) : recordState === 'manual' ? (
              <>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Tulis Catatan Manual
                </h2>
                <p className="text-xs text-ink-muted">
                  Ketik cerita harianmu langsung jika sedang tidak nyaman berbicara.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
                  Apa yang sedang kamu pikirkan?
                </h2>
                <p className="text-xs text-ink-muted">
                  Bicara saja secara alami, AI akan merapikan cerita jurnalmu.
                </p>
              </>
            )}
          </div>

          {/* Interactive Recording Core */}
          <div className="relative flex flex-col items-center justify-center my-auto w-full max-w-sm">
            {errorMessage && recordState !== 'permission_denied' && (
              <div className="bg-danger/15 border border-danger/30 text-danger p-3 rounded-xl mb-4 text-xs flex items-center gap-2 text-left w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSaving && (
              <div className="bg-surface/95 backdrop-blur-md border border-accent/30 rounded-2xl p-8 w-full flex flex-col items-center space-y-4 shadow-2xl z-30">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
                <div className="text-sm font-bold text-ink">Menyimpan ke Firestore...</div>
                <p className="text-xs text-ink-muted">Mengamankan catatan & meng-update streak</p>
              </div>
            )}

            {/* IDLE STATE */}
            {!isSaving && recordState === 'idle' && (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="absolute w-48 h-48 rounded-full bg-accent/10 animate-ping pointer-events-none" />
                  <button
                    onClick={startRecording}
                    aria-label="Mulai Merekam Suara"
                    className="relative group w-40 h-40 rounded-full bg-accent text-canvas flex flex-col items-center justify-center shadow-xl shadow-accent/25 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <Mic className="w-14 h-14 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Rekam
                    </span>
                  </button>
                </div>
                <span className="text-xs font-mono text-ink-muted">
                  Ketuk tombol untuk mulai rekam
                </span>
              </div>
            )}

            {/* RECORDING STATE */}
            {!isSaving && recordState === 'recording' && (
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="bg-surface border border-accent/30 rounded-2xl p-5 w-full flex flex-col items-center shadow-lg">
                  <AudioWaveformVisualizer mediaStream={mediaStream} isRecording={true} />
                  <span className="text-2xl font-mono font-bold text-accent mt-3">
                    {formatTimer(recordingDuration)}
                  </span>
                </div>

                <button
                  onClick={stopRecording}
                  aria-label="Berhenti Merekam"
                  className="w-36 h-14 rounded-2xl bg-danger text-ink flex items-center justify-center gap-2 font-bold shadow-lg shadow-danger/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Berhenti</span>
                </button>
              </div>
            )}

            {/* STOPPED STATE */}
            {!isSaving && recordState === 'stopped' && (
              <div className="bg-surface border border-surface-alt rounded-2xl p-6 w-full space-y-5 shadow-xl">
                <div className="bg-canvas border border-accent/20 rounded-xl p-4 flex items-center gap-3">
                  <button
                    onClick={togglePlayPreview}
                    className="w-12 h-12 rounded-full bg-accent text-canvas flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-mono font-semibold text-accent">
                      Audio Rekaman Tersimpan
                    </div>
                    <div className="text-[11px] font-mono text-ink-muted mt-0.5">
                      Durasi: {formatTimer(recordingDuration)} • {audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-surface-alt hover:bg-surface-alt/80 text-ink text-xs font-semibold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-ink-muted" />
                    <span>Rekam Ulang</span>
                  </button>

                  <button
                    onClick={handleProcessAI}
                    className="flex-1 bg-accent text-canvas text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Proses AI</span>
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING STATE */}
            {!isSaving && recordState === 'processing' && (
              <div className="bg-surface border border-accent/30 rounded-2xl p-8 w-full flex flex-col items-center space-y-4 shadow-2xl">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
                  <Sparkles className="w-5 h-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <WaveformDecoration bars={14} active={true} className="h-6" />
                <div className="space-y-1 text-center">
                  <div className="text-sm font-semibold text-ink">Merapikan Catatan...</div>
                  <div className="text-xs text-ink-muted">Gemini 2.5 Flash Multimodal Engine</div>
                </div>
              </div>
            )}

            {/* REVIEW STATE */}
            {!isSaving && recordState === 'review' && (
              <div className="bg-surface border border-surface-alt rounded-2xl p-5 w-full space-y-4 shadow-xl text-left">
                <div className="bg-canvas border border-surface-alt/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPreview}
                      className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center"
                    >
                      {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <span className="text-accent font-semibold">Audio Original</span>
                  </div>
                  <span className="text-ink-muted">{formatTimer(recordingDuration)}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                    Rangkuman AI (Dapat Diedit):
                  </label>
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={5}
                    className="w-full bg-canvas border border-accent/30 rounded-xl p-3 text-sm text-ink leading-relaxed focus:outline-none focus:border-accent"
                  />
                </div>

                {aiResult && (
                  <div className="flex items-center justify-between text-xs border-t border-surface-alt/60 pt-3">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Smile className="w-3.5 h-3.5 text-accent" />
                      <span>Mood: <strong className="text-ink">{aiResult.mood || 'Netral'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-accent" />
                      {aiResult.tags?.map((t, idx) => (
                        <span key={idx} className="bg-accent-soft text-accent px-2 py-0.5 rounded-md font-mono text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult?.transcriptRaw && (
                  <div className="border-t border-surface-alt/60 pt-3">
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="flex items-center justify-between w-full text-xs font-mono text-ink-muted hover:text-ink transition-colors"
                    >
                      <span>Lihat Transkrip Mentah</span>
                      {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showTranscript && (
                      <p className="mt-2 text-xs font-mono text-ink-muted bg-canvas p-3 rounded-xl leading-relaxed">
                        "{aiResult.transcriptRaw}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-surface-alt hover:bg-surface-alt/80 text-ink text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-ink-muted" />
                    <span>Batal / Reset</span>
                  </button>

                  <button
                    onClick={handleInitiateSave}
                    className="flex-1 bg-accent text-canvas text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
              </div>
            )}

            {/* MANUAL STATE */}
            {!isSaving && recordState === 'manual' && (
              <div className="bg-surface border border-surface-alt rounded-2xl p-4 w-full space-y-4 shadow-xl text-left">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Tuliskan harimu secara rinci di sini..."
                  rows={6}
                  className="w-full bg-canvas border border-surface-alt rounded-xl p-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setRecordState('idle')}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    Kembali ke Rekam Suara
                  </button>
                  <button
                    disabled={!manualText.trim()}
                    onClick={handleInitiateSave}
                    className="bg-accent disabled:opacity-50 text-canvas text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <span>Simpan Catatan</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PERMISSION DENIED STATE */}
            {!isSaving && recordState === 'permission_denied' && (
              <div className="bg-surface border border-danger/30 rounded-2xl p-5 w-full text-left space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Akses Mikrofon Diperlukan</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setRecordState('manual')}
                    className="w-full bg-accent text-canvas text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Beralih ke Tulis Manual</span>
                  </button>
                  <button
                    onClick={() => setRecordState('idle')}
                    className="w-full text-xs text-ink-muted hover:text-ink py-2"
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
                className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:underline px-4 py-2 rounded-lg hover:bg-surface-alt/40 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Tulis manual sebagai gantinya</span>
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Desktop Studio Guide & Prompt Starters (Tampil khusus di Desktop) */}
        <div className="hidden md:flex md:col-span-5 flex-col space-y-5">
          {/* Card 1: Prompt Starters */}
          <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-4 shadow-lg text-left">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <Lightbulb className="w-4 h-4" />
              <span>Bingung Mulai Bicara?</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Pilih salah satu topik di bawah sebagai pemantik tulisan jurnalmu hari ini:
            </p>
            <div className="space-y-2.5">
              {PROMPT_STARTERS.map((starter, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-canvas/70 border border-surface-alt/60 rounded-xl text-xs text-ink leading-relaxed hover:border-accent/30 transition-colors"
                >
                  "{starter}"
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Gemini Specs */}
          <div className="bg-surface border border-accent/20 rounded-3xl p-6 space-y-3 shadow-lg text-left relative overflow-hidden">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Cara Kerja Voice AI</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Google Gemini 2.5 Flash mendengar audio rekamanmu secara langsung, merapikan kata-kata pengisi ('eee', 'anu'), dan mempertahankan seluruh detail angka & tanggal tanpa mengubah fakta.
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-accent">
              <span>Client-Side Multimodal</span>
              <span>Firestore Isolated</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI SIMPAN AUDIO */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-accent/30 rounded-2xl p-6 max-w-xs w-full space-y-4 text-center shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
              <Volume2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-ink">
                Simpan Rekaman Suara Asli?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Kamu dapat menyimpan file audio ke cloud untuk diputar kembali nanti, atau hanya menyimpan teks rangkuman.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => executeSave(true)}
                className="w-full bg-accent text-canvas text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-accent/20"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ya, Simpan Audio & Teks</span>
              </button>

              <button
                onClick={() => executeSave(false)}
                className="w-full bg-surface-alt hover:bg-surface-alt/80 text-ink text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <VolumeX className="w-4 h-4 text-ink-muted" />
                <span>Tidak, Simpan Teks Saja</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
