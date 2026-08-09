import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, List, Volume2, Mic, Plus, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JournalCalendar } from '../../components/JournalCalendar';
import { JournalEntry } from '../../types';
import { getUserEntries } from '../../lib/entries';
import { auth } from '../../lib/firebase';
import { generateWeeklyRecapWithGemini } from '../../lib/ai';
import { ROUTES } from '../../lib/constants';
import { SAMPLE_ENTRIES } from '../../lib/sampleData';

export const EntriesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fitur Stretch: Weekly Recap AI
  const [weeklyRecap, setWeeklyRecap] = useState<string | null>(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);

  useEffect(() => {
    async function loadEntries() {
      setLoading(true);
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
        <mark key={i} className="neu-inset-sm bg-accent/20 text-accent font-bold rounded px-1">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari isi catatan atau hashtag..."
            className="w-full neu-inset rounded-2xl pl-11 pr-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent"
          />
        </div>
        
        {/* Segmented Neumorphic Switcher */}
        <div className="flex neu-inset-sm rounded-2xl p-1.5 gap-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'neu-raised text-accent font-bold scale-[1.02]'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'neu-raised text-accent font-bold scale-[1.02]'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Kalender</span>
          </button>
        </div>
      </div>

      {/* Banner AI Ringkasan Mingguan */}
      <div className="neu-card p-6 text-left space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent font-semibold text-xs font-mono">
            <div className="w-6 h-6 rounded-full neu-inset-sm flex items-center justify-center text-accent">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>AI Ringkasan Mingguan</span>
          </div>
          {!weeklyRecap && (
            <button
              onClick={handleGenerateWeeklyRecap}
              disabled={isGeneratingRecap}
              className="neu-button text-accent text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isGeneratingRecap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Buat Recap</span>
            </button>
          )}
        </div>

        {weeklyRecap ? (
          <p className="text-xs text-ink leading-relaxed neu-inset p-4 rounded-2xl font-sans">
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
              {selectedDate && (
                <span className="neu-pill px-3 py-1 text-accent font-semibold text-[11px]">
                  Tanggal: {selectedDate}
                </span>
              )}
            </div>

            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entries/${entry.id}`}
                  className="block neu-card p-5 transition-all duration-200 text-left hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-2">
                    <span>{formatDate(entry.createdAt)}</span>
                    {entry.hasAudio && (
                      <span className="neu-pill px-2.5 py-0.5 text-accent text-[11px] font-semibold flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
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
              <div className="neu-card p-8 text-center text-xs text-ink-muted">
                Tidak ada catatan pada tanggal ini.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-ink-muted space-y-3">
              <div className="w-12 h-12 rounded-full neu-inset flex items-center justify-center text-accent">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <span className="text-xs font-mono">Memuat catatan dari Firestore...</span>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/entries/${entry.id}`}
                  className="block neu-card p-5 transition-all duration-200 text-left flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-ink-muted mb-3">
                      <span>{formatDate(entry.createdAt)}</span>
                      {entry.hasAudio && (
                        <span className="neu-pill px-2.5 py-0.5 text-accent text-[11px] font-semibold flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-ink line-clamp-3 leading-relaxed font-sans">
                      {highlightSearch(entry.content, searchQuery)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {entry.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full neu-inset-sm text-accent">
                          #{t}
                        </span>
                      ))}
                    </div>
                    {entry.mood && (
                      <span className="text-[11px] text-ink-muted font-mono">
                        Mood: <strong className="text-ink font-semibold">{entry.mood}</strong>
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="neu-card p-12 text-center space-y-5 my-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full neu-inset text-accent flex items-center justify-center mx-auto">
                <Mic className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-lg text-ink">Belum Ada Catatan</h3>
                <p className="text-xs text-ink-muted leading-relaxed max-w-xs mx-auto">
                  {searchQuery
                    ? `Tidak ada catatan yang cocok dengan kata kunci "${searchQuery}".`
                    : 'Mulai rekaman suaramu yang pertama untuk membangun jurnal harian.'}
                </p>
              </div>
              <Link
                to={ROUTES.HOME}
                className="inline-flex items-center gap-2 neu-button text-accent font-bold px-6 py-3.5 rounded-2xl text-xs"
              >
                <Plus className="w-4 h-4 text-accent" />
                <span>Buat Catatan Baru</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
