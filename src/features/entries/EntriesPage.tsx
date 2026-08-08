import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, List, Volume2, Mic, Plus, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JournalCalendar } from '../../components/JournalCalendar';
import { JournalEntry } from '../../types';
import { getUserEntries } from '../../lib/entries';
import { auth } from '../../lib/firebase';
import { generateWeeklyRecapWithGemini } from '../../lib/ai';

export const EntriesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fitur Stretch: Weekly Recap AI
  const [weeklyRecap, setWeeklyRecap] = useState<string | null>(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);

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
      setLoading(true);
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
      setLoading(false);
    }

    loadEntries();
  }, []);

  const handleGenerateWeeklyRecap = async () => {
    setIsGeneratingRecap(true);
    try {
      const recapText = await generateWeeklyRecapWithGemini(entries);
      setWeeklyRecap(recapText);
    } catch (err) {
      console.error('Error generating weekly recap:', err);
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      if (isToday) {
        return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesQuery = searchQuery.trim() === '' || 
      (entry.content && entry.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.transcriptRaw && entry.transcriptRaw.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDate = !selectedDate || (entry.createdAt && entry.createdAt.startsWith(selectedDate));

    return matchesQuery && matchesDate;
  });

  const highlightSearch = (text: string, queryStr: string) => {
    if (!queryStr.trim()) return text;

    const parts = text.split(new RegExp(`(${queryStr})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === queryStr.toLowerCase() ? (
        <mark key={i} className="bg-accent/40 text-ink rounded px-0.5 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Search & View Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari isi catatan atau hashtag..."
            className="w-full bg-surface border border-surface-alt rounded-2xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent shadow-sm"
          />
        </div>
        <div className="flex bg-surface border border-surface-alt rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
              viewMode === 'list' ? 'bg-accent text-canvas font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar List</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
              viewMode === 'calendar' ? 'bg-accent text-canvas font-semibold' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Kalender</span>
          </button>
        </div>
      </div>

      {/* Banner AI Ringkasan Mingguan (Stretch Feature Tahap 11) */}
      <div className="bg-surface border border-accent/30 rounded-3xl p-5 shadow-lg text-left space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent font-semibold text-xs font-mono">
            <Sparkles className="w-4 h-4" />
            <span>AI Ringkasan Mingguan</span>
          </div>
          {!weeklyRecap && (
            <button
              onClick={handleGenerateWeeklyRecap}
              disabled={isGeneratingRecap}
              className="bg-accent-soft hover:bg-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              {isGeneratingRecap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Buat Recap</span>
            </button>
          )}
        </div>

        {weeklyRecap ? (
          <p className="text-xs text-ink leading-relaxed bg-canvas p-3 rounded-2xl border border-accent/20 font-sans">
            "{weeklyRecap}"
          </p>
        ) : (
          <p className="text-xs text-ink-muted leading-relaxed">
            Dapatkan rangkuman otomatis 1 paragraf dari Gemini AI mengenai tren topik & mood jurnalmu minggu ini.
          </p>
        )}
      </div>

      {/* Responsive Layout Content Grid */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5">
            <JournalCalendar
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </div>

          <div className="md:col-span-7 space-y-3">
            <div className="text-xs font-mono text-ink-muted px-1 flex items-center justify-between">
              <span>Catatan Terfilter ({filteredEntries.length})</span>
              {selectedDate && <span className="text-accent font-semibold">Tanggal: {selectedDate}</span>}
            </div>

            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entries/${entry.id}`}
                  className="block bg-surface hover:bg-surface-alt border border-surface-alt/70 hover:border-accent/30 rounded-2xl p-4 transition-all duration-200 shadow-sm text-left"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
                    <span>{formatDate(entry.createdAt)}</span>
                    {entry.hasAudio && (
                      <span className="flex items-center gap-1 text-accent font-semibold">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Audio</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink line-clamp-3 leading-relaxed font-sans">
                    {highlightSearch(entry.content, searchQuery)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="bg-surface border border-surface-alt rounded-2xl p-6 text-center text-xs text-ink-muted">
                Tidak ada catatan pada tanggal ini.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-ink-muted space-y-2">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <span className="text-xs font-mono">Memuat catatan dari Firestore...</span>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entries/${entry.id}`}
                  className="block bg-surface hover:bg-surface-alt border border-surface-alt/70 hover:border-accent/30 rounded-2xl p-5 transition-all duration-200 shadow-sm text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
                      <span>{formatDate(entry.createdAt)}</span>
                      {entry.hasAudio && (
                        <span className="flex items-center gap-1 text-accent font-semibold">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-ink line-clamp-3 leading-relaxed font-sans">
                      {highlightSearch(entry.content, searchQuery)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-surface-alt/40">
                    <div className="flex items-center gap-1.5">
                      {entry.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-soft text-accent">
                          #{t}
                        </span>
                      ))}
                    </div>
                    {entry.mood && (
                      <span className="text-[11px] text-ink-muted font-mono">
                        Mood: <strong className="text-ink">{entry.mood}</strong>
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-surface-alt rounded-3xl p-10 text-center space-y-4 my-6">
              <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-lg text-ink">Belum Ada Catatan</h3>
                <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
                  {searchQuery
                    ? `Tidak ada catatan yang cocok dengan kata kunci "${searchQuery}".`
                    : 'Mulai rekaman suaramu yang pertama untuk membangun jurnal harian.'}
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-accent text-canvas font-bold px-5 py-3 rounded-xl text-xs hover:scale-105 transition-all shadow-md shadow-accent/20"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Catatan Baru</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
