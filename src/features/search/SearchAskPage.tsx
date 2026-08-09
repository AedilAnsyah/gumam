import React, { useState, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, BookOpen, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { askJournalAI, AskJournalResult } from '../../lib/ai';
import { getUserEntries } from '../../lib/entries';
import { auth } from '../../lib/firebase';
import { JournalEntry } from '../../types';
import { WaveformDecoration } from '../../components/WaveformDecoration';
import { APP_NAME } from '../../lib/constants';
import { SAMPLE_ENTRIES, SAMPLE_SUGGESTIONS } from '../../lib/sampleData';

export const SearchAskPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<AskJournalResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntries() {
      const user = auth.currentUser;
      if (user) {
        const firestoreEntries = await getUserEntries(user.uid);
        if (firestoreEntries.length > 0) {
          setEntries(firestoreEntries);
        } else {
          setEntries(SAMPLE_ENTRIES);
        }
      } else {
        setEntries(SAMPLE_ENTRIES);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Anda harus login untuk menggunakan fitur ini.');
      }
      
      const result = await askJournalAI(user.uid, q);
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
          <div className="neu-card p-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-1">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span>{`Tanya ke ${APP_NAME} (AI Search)`}</span>
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
              className="w-full neu-inset rounded-2xl pl-5 pr-16 py-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent"
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              aria-label="Kirim Pertanyaan AI"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl neu-button disabled:opacity-50 text-accent flex items-center justify-center cursor-pointer"
            >
              {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {/* Loading Processing State */}
          {isAsking && (
            <div className="neu-groove p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full neu-raised flex items-center justify-center text-accent mx-auto">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <WaveformDecoration bars={14} active={true} className="h-6" />
              <div className="text-xs font-mono text-ink">Membaca & menganalisis riwayat catatan jurnalmu...</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="neu-inset-sm text-danger p-4 rounded-2xl text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Answer Result Card */}
          {aiAnswer && (
            <div className="neu-card p-6 md:p-8 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center gap-2 text-accent font-semibold text-xs border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                <div className="w-6 h-6 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>{`Jawaban AI ${APP_NAME}`}</span>
              </div>

              <p className="text-sm text-ink leading-relaxed font-sans neu-inset-sm p-4 rounded-2xl">
                {aiAnswer.answer}
              </p>

              {/* Source Reference Links */}
              {aiAnswer.referencedEntryIds && aiAnswer.referencedEntryIds.length > 0 && (
                <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-4 space-y-2">
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
                          className="neu-pill px-4 py-2 text-xs font-mono text-accent flex items-center gap-1.5 hover:neu-inset-sm transition-all"
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
                <div className="text-[11px] font-mono text-ink-muted italic border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                  💡 Jawaban ini dihasilkan secara jujur tanpa mengarang data dari luar jurnalmu.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Suggestion Chips & Tips (Tampil khusus di Desktop) */}
        <div className="md:col-span-5 space-y-6 text-left">
          <div className="neu-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-accent font-semibold text-sm">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span>Contoh Pertanyaan</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Klik pertanyaan di bawah untuk langsung menanyakannya ke AI:
            </p>
            <div className="flex flex-col gap-2.5">
              {SAMPLE_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(item);
                    handleAsk(item);
                  }}
                  className="text-left text-xs neu-inset-sm hover:neu-inset rounded-2xl px-4 py-3 text-ink transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{item}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="neu-card p-6 space-y-2 text-xs text-ink-muted">
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
