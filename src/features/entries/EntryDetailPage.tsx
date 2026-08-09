import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle2, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Smile 
} from 'lucide-react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { JournalEntry } from '../../types';
import { FIRESTORE_COLLECTION_ENTRIES, ROUTES } from '../../lib/constants';
import { SAMPLE_ENTRY_DETAIL } from '../../lib/sampleData';

export const EntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchEntryDetail() {
      if (!id) return;
      setLoading(true);

      try {
        const docRef = doc(db, FIRESTORE_COLLECTION_ENTRIES, id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const entryData = { id: snap.id, ...snap.data() } as JournalEntry;
          setEntry(entryData);
          setEditedContent(entryData.content);

          // Fetch audio URL jika ada
          if (entryData.hasAudio && entryData.audioStoragePath) {
            try {
              const storageRef = ref(storage, entryData.audioStoragePath);
              const url = await getDownloadURL(storageRef);
              setAudioUrl(url);
            } catch (err) {
              console.warn('Gagal mengambil audio URL dari Storage:', err);
            }
          }
        } else {
          // Fallback data sampel jika ID adalah data dummy
          setEntry(SAMPLE_ENTRY_DETAIL);
          setEditedContent(SAMPLE_ENTRY_DETAIL.content);
        }
      } catch (err) {
        console.error('Error fetching entry detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntryDetail();
  }, [id]);

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!id || !entry) return;
    setIsSaving(true);
    try {
      if (!id.startsWith('sample')) {
        const docRef = doc(db, FIRESTORE_COLLECTION_ENTRIES, id);
        await updateDoc(docRef, {
          content: editedContent,
          updatedAt: new Date().toISOString()
        });
      }
      setEntry({ ...entry, content: editedContent });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating entry content:', err);
      alert('Gagal memperbarui catatan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Entry
  const handleDelete = async () => {
    if (!id || !entry) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan ini secara permanen?')) return;

    try {
      if (!id.startsWith('sample')) {
        // Hapus file audio dari Storage jika ada
        if (entry.hasAudio && entry.audioStoragePath) {
          try {
            const storageRef = ref(storage, entry.audioStoragePath);
            await deleteObject(storageRef);
          } catch (err) {
            console.warn('Audio storage file deletion warning:', err);
          }
        }
        // Hapus dokumen dari Firestore
        const docRef = doc(db, FIRESTORE_COLLECTION_ENTRIES, id);
        await deleteDoc(docRef);
      }
      navigate(ROUTES.ENTRIES);
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Gagal menghapus catatan.');
    }
  };

  // Toggle Audio Playback
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-ink-muted space-y-3">
        <div className="w-12 h-12 rounded-full neu-inset flex items-center justify-center text-accent">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <span className="text-xs font-mono">Memuat detail catatan...</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="neu-card p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <p className="text-sm text-ink-muted">Catatan tidak ditemukan.</p>
        <button
          onClick={() => navigate(ROUTES.ENTRIES)}
          className="neu-button px-5 py-2.5 rounded-2xl text-xs font-semibold text-accent"
        >
          Kembali ke Daftar Catatan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.ENTRIES)}
          className="neu-button flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs text-ink-muted hover:text-ink font-mono cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 neu-button text-ink-muted hover:text-accent rounded-2xl flex items-center justify-center cursor-pointer transition-all"
            title="Edit Catatan"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 neu-button text-ink-muted hover:text-danger rounded-2xl flex items-center justify-center cursor-pointer transition-all"
            title="Hapus Catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="neu-card p-6 md:p-8 space-y-5 text-left">
        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
          <span className="neu-pill px-3 py-1 text-accent font-semibold">Catatan Jurnal</span>
          <span>{new Date(entry.createdAt).toLocaleString('id-ID')}</span>
        </div>

        {/* Audio Player if available */}
        {entry.hasAudio && audioUrl && (
          <div className="neu-inset rounded-2xl p-4 flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full neu-raised hover:neu-inset active:neu-inset text-accent flex items-center justify-center shrink-0 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-ink mb-1.5">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <Volume2 className="w-4 h-4" /> Rekaman Suara Asli
                </span>
              </div>
              <div className="w-full neu-inset-sm h-2 rounded-full overflow-hidden bg-surface-alt">
                <div className={`bg-accent h-full rounded-full ${isPlaying ? 'w-full transition-all duration-1000' : 'w-1/3'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Content Section (View or Edit Mode) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-accent tracking-wider">
              {entry.source === 'voice' ? 'Rangkuman AI' : 'Catatan Tulisan Manual'}
            </h3>
            {isEditing && (
              <span className="neu-pill px-3 py-0.5 text-[10px] font-mono text-warning font-semibold">
                Mode Edit
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={6}
                className="w-full neu-inset rounded-2xl p-4 text-sm text-ink leading-relaxed focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent resize-none"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setIsEditing(false)}
                  className="neu-button px-4 py-2 rounded-xl text-xs text-ink-muted hover:text-ink cursor-pointer"
                >
                  Batal
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleSaveEdit}
                  className="neu-button text-accent px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink leading-relaxed font-sans whitespace-pre-wrap neu-inset-sm p-5 rounded-2xl">
              {entry.content}
            </p>
          )}
        </div>

        {/* Mood & Tags */}
        <div className="flex items-center justify-between text-xs border-t border-black/[0.04] dark:border-white/[0.04] pt-4">
          {entry.mood && (
            <div className="flex items-center gap-2 text-ink-muted">
              <Smile className="w-4 h-4 text-accent" />
              <span>Mood: <strong className="text-ink font-semibold">{entry.mood}</strong></span>
            </div>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-accent" />
              {entry.tags.map((t, idx) => (
                <span key={idx} className="neu-pill px-3 py-0.5 text-accent font-mono text-[10px] font-semibold">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Transcript Raw */}
        {entry.transcriptRaw && (
          <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-4">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center justify-between w-full text-xs font-mono text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <span>Transkrip Suara Mentah</span>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTranscript && (
              <p className="mt-2 text-xs font-mono text-ink-muted neu-inset p-4 rounded-2xl leading-relaxed italic">
                "{entry.transcriptRaw}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
