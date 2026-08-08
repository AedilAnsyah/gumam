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
        const docRef = doc(db, 'entries', id);
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
          const sampleData: JournalEntry = {
            id: id || 'sample',
            userId: 'demo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: 'Tadi beli galon di warung sebelah, harganya 20rb. Cuaca lumayan panas tapi untung dapat es kelapa segar.',
            transcriptRaw: 'Eee... tadi siang saya ke warung sebelah beli galon harganya dua puluh ribu...',
            hasAudio: true,
            mood: 'Senang',
            tags: ['Harian', 'Belanja']
          };
          setEntry(sampleData);
          setEditedContent(sampleData.content);
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
        const docRef = doc(db, 'entries', id);
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
        const docRef = doc(db, 'entries', id);
        await deleteDoc(docRef);
      }
      navigate('/entries');
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-ink-muted space-y-2">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs font-mono">Memuat detail catatan...</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-sm text-ink-muted">Catatan tidak ditemukan.</p>
        <button
          onClick={() => navigate('/entries')}
          className="text-xs font-semibold text-accent underline"
        >
          Kembali ke Daftar Catatan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 px-4 pt-2">
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-ink-muted hover:text-accent rounded-lg transition-colors"
            title="Edit Catatan"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-ink-muted hover:text-danger rounded-lg transition-colors"
            title="Hapus Catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-surface border border-surface-alt rounded-2xl p-5 space-y-4 shadow-lg">
        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-surface-alt/60 pb-3">
          <span>Catatan Jurnal</span>
          <span>{new Date(entry.createdAt).toLocaleString('id-ID')}</span>
        </div>

        {/* Audio Player if available */}
        {entry.hasAudio && audioUrl && (
          <div className="bg-canvas border border-accent/20 rounded-xl p-3 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-accent text-canvas flex items-center justify-center shrink-0 hover:scale-105 transition-all shadow-md shadow-accent/20"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono text-ink mb-1">
                <span className="flex items-center gap-1 text-accent font-semibold">
                  <Volume2 className="w-3.5 h-3.5" /> Rekaman Suara Asli
                </span>
              </div>
              <div className="w-full bg-surface-alt h-1.5 rounded-full overflow-hidden">
                <div className={`bg-accent h-full ${isPlaying ? 'w-full transition-all duration-1000' : 'w-1/3'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Content Section (View or Edit Mode) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase text-accent tracking-wider">
              {entry.source === 'voice' ? 'Rangkuman AI' : 'Catatan Tulisan Manual'}
            </h3>
            {isEditing && (
              <span className="text-[10px] font-mono text-warning">Mode Edit</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={6}
                className="w-full bg-canvas border border-accent/40 rounded-xl p-3 text-sm text-ink leading-relaxed focus:outline-none focus:border-accent"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
                >
                  Batal
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleSaveEdit}
                  className="bg-accent text-canvas px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:scale-105 transition-all shadow-md"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink leading-relaxed font-sans whitespace-pre-wrap">
              {entry.content}
            </p>
          )}
        </div>

        {/* Mood & Tags */}
        <div className="flex items-center justify-between text-xs border-t border-surface-alt/60 pt-3">
          {entry.mood && (
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Smile className="w-3.5 h-3.5 text-accent" />
              <span>Mood: <strong className="text-ink">{entry.mood}</strong></span>
            </div>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-accent" />
              {entry.tags.map((t, idx) => (
                <span key={idx} className="bg-accent-soft text-accent px-2 py-0.5 rounded-md font-mono text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Transcript Raw */}
        {entry.transcriptRaw && (
          <div className="border-t border-surface-alt/60 pt-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center justify-between w-full text-xs font-mono text-ink-muted hover:text-ink transition-colors"
            >
              <span>Transkrip Suara Mentah</span>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTranscript && (
              <p className="mt-2 text-xs font-mono text-ink-muted bg-canvas p-3 rounded-xl leading-relaxed italic">
                "{entry.transcriptRaw}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
