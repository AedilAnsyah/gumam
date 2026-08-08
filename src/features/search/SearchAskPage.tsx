import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, BookOpen, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { askJournalWithGemini, AskJournalResult } from '../../lib/ai';
import { getUserEntries } from '../../lib/entries';
import { auth } from '../../lib/firebase';
import { JournalEntry } from '../../types';
import { WaveformDecoration } from '../../components/WaveformDecoration';

export const SearchAskPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<AskJournalResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleSuggestions = [
    'Terakhir beli galon kapan dan berapa harganya?',
    'Apa saja hal menarik minggu ini?',
    'Bagaimana progres proyek VibeCode?'
  ];

  const sampleEntries: JournalEntry[] = [
    {
      id: 'sample-1',
      userId: 'demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: 'Tadi beli galon di warung sebelah, harganya 20rb. Cuaca lumayan panas tapi untung dapat es kelapa segar.',
      transcriptRaw: 'Eee... tadi siang saya ke warung sebelah beli galon harganya dua puluh ribu...',
      hasAudio: true,
      mood: 'Senang',
      tags: ['Harian', 'Belanja']
    },
    {
      id: 'sample-2',
      userId: 'demo',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      content: 'Rapat pagi berjalan lancar. Tim sepakat memakai arsitektur PWA berbasis AI untuk kompetisi VibeCode 2026.',
      transcriptRaw: 'Rapat pagi tadi tim sepakat pakai arsitektur PWA...',
      hasAudio: false,
      mood: 'Fokus',
      tags: ['Kerja', 'Proyek']
    }
  ];

  useEffect(() => {
    async function loadEntries() {
      const user = auth.currentUser;
      if (user) {
        const firestoreEntries = await getUserEntries(user.uid);
        if (firestoreEntries.length > 0) {
          setEntries(firestoreEntries);
        } else {
          setEntries(sampleEntries);
        }
      } else {
        setEntries(sampleEntries);
      }
    }

    loadEntries();
  }, []);

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setIsAsking(true);
    setErrorMessage(null);
    setAiAnswer(null);

    try {
      const result = await askJournalWithGemini(q, entries);
      setAiAnswer(result);
    } catch (err: any) {
      console.error('Error asking Gemini AI:', err);
      setErrorMessage(err.message || 'Gagal memproses pertanyaan.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 w-full">
      {/* Layout Grid Responsif: Mobile 1 Kolom, Desktop 2 Kolom (7:5) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Input & Hasil Jawab AI */}
        <div className="md:col-span-7 space-y-6">
          {/* Header Banner */}
          <div className="bg-surface border border-accent/30 rounded-3xl p-6 relative overflow-hidden shadow-lg text-left">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-1.5">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span>Tanya ke Gumam (AI Search)</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Tanyakan apa saja tentang memori & catatan lamamu. AI akan mencari dan merangkum jawaban natural berdasarkan isi jurnalmu.
            </p>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="relative"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Coba tanya: 'kapan terakhir beli galon?'"
              className="w-full bg-surface border border-surface-alt rounded-2xl pl-5 pr-14 py-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent shadow-md"
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              aria-label="Kirim Pertanyaan AI"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent disabled:opacity-50 text-canvas flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20"
            >
              {isAsking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 fill-current" />}
            </button>
          </form>

          {/* Loading Processing State */}
          {isAsking && (
            <div className="bg-surface border border-accent/30 rounded-3xl p-8 text-center space-y-4 shadow-xl animate-fadeIn">
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
              <WaveformDecoration bars={14} active={true} className="h-6" />
              <div className="text-xs font-mono text-ink">Membaca & menganalisis riwayat catatan jurnalmu...</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-danger/15 border border-danger/30 text-danger p-4 rounded-2xl text-xs flex items-center gap-2 text-left shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Answer Result Card */}
          {aiAnswer && (
            <div className="bg-surface border border-accent/40 rounded-3xl p-6 space-y-4 shadow-xl animate-fadeIn text-left">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs border-b border-surface-alt/60 pb-3">
                <Sparkles className="w-4 h-4" />
                <span>Jawaban AI Gumam</span>
              </div>

              <p className="text-sm text-ink leading-relaxed font-sans font-normal">
                {aiAnswer.answer}
              </p>

              {/* Source Reference Links */}
              {aiAnswer.referencedEntryIds && aiAnswer.referencedEntryIds.length > 0 && (
                <div className="border-t border-surface-alt/60 pt-3 space-y-2">
                  <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                    Catatan Sumber Relevan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aiAnswer.referencedEntryIds.map((refId) => {
                      const matchedEntry = entries.find((e) => e.id === refId);
                      return (
                        <Link
                          key={refId}
                          to={`/entries/${refId}`}
                          className="inline-flex items-center gap-1.5 bg-accent-soft/70 hover:bg-accent/20 border border-accent/30 text-accent px-3.5 py-2 rounded-xl text-xs font-mono transition-all hover:scale-105"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            {matchedEntry ? `Catatan (${new Date(matchedEntry.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })})` : `Catatan #${refId}`}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {!aiAnswer.found && (
                <div className="text-[11px] font-mono text-ink-muted italic border-t border-surface-alt/60 pt-2">
                  💡 Jawaban ini dihasilkan secara jujur tanpa mengarang data dari luar jurnalmu.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Suggestion Chips & Tips (Tampil khusus di Desktop) */}
        <div className="md:col-span-5 space-y-5 text-left">
          <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Contoh Pertanyaan</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Klik pertanyaan di bawah untuk langsung menanyakannya ke AI:
            </p>
            <div className="flex flex-col gap-2.5">
              {sampleSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(item);
                    handleAsk(item);
                  }}
                  className="text-left text-xs bg-canvas/80 hover:bg-canvas border border-surface-alt/80 hover:border-accent/40 rounded-xl px-4 py-3 text-ink-muted hover:text-ink transition-colors flex items-center justify-between group shadow-sm"
                >
                  <span>{item}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 border border-surface-alt rounded-3xl p-6 space-y-2 text-xs text-ink-muted">
            <div className="font-semibold text-ink">Privasi & Anti-Halusinasi</div>
            <p className="leading-relaxed">
              Pencarian dilakukan secara privat. Gemini AI diprogram secara khusus untuk menolak mengarang informasi apabila catatan yang dicari tidak ditemukan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
