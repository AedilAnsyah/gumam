import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Shield, UserCheck, Smartphone, Check, Moon, Sun, Download, Upload, Flame, Sparkles } from 'lucide-react';
import { RecFrequency, JournalEntry } from '../../types';
import { sendTestNotification, isNotificationGranted, requestNotificationPermission } from '../../lib/notifications';
import { useTheme } from '../../lib/theme';
import { exportJournalDataAsJSON, importJournalDataFromJSON } from '../../lib/exportImport';
import { getUserEntries } from '../../lib/entries';
import { auth } from '../../lib/firebase';
import { LS_KEY_SETTINGS, DEFAULT_FREQUENCY, DEFAULT_REMINDER_TIME } from '../../lib/constants';

export const SettingsPage: React.FC = () => {
  const [frequency, setFrequency] = useState<RecFrequency>(DEFAULT_FREQUENCY as RecFrequency);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { theme, setTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHasNotifPermission(isNotificationGranted());

    const settingsStr = localStorage.getItem(LS_KEY_SETTINGS);
    if (settingsStr) {
      try {
        const parsed = JSON.parse(settingsStr);
        if (parsed.frequency) setFrequency(parsed.frequency);
        if (parsed.reminderTime) setReminderTime(parsed.reminderTime);
      } catch (err) {
        console.warn('Error reading local settings:', err);
      }
    }

    async function loadEntries() {
      const user = auth.currentUser;
      if (user) {
        const fetched = await getUserEntries(user.uid);
        setEntries(fetched);
      }
    }
    loadEntries();
  }, []);

  const handleSaveSettings = () => {
    const newSettings = {
      frequency,
      reminderTime,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(newSettings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPermission(granted);
    if (granted) {
      sendTestNotification();
    }
  };

  const handleExport = () => {
    exportJournalDataAsJSON(entries);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedEntries = await importJournalDataFromJSON(file);
      alert(`Berhasil membaca backup ${importedEntries.length} catatan jurnal!`);
    } catch (err: any) {
      alert('Gagal mengimpor file backup: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 w-full text-left">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl md:text-2xl font-bold text-ink">Setelan Aplikasi</h2>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-success font-semibold animate-pulse bg-success/15 border border-success/30 px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5" /> Setelan Tersimpan!
          </span>
        )}
      </div>

      {/* Grid Responsif Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Frekuensi & Reminder */}
        <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-surface-alt/60 pb-3">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink">Frekuensi & Reminder</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5">
                Target Frekuensi Mencatat
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecFrequency)}
                className="w-full bg-canvas border border-surface-alt rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="1x/hari">1x Setiap Hari</option>
                <option value="2x/hari">2x Setiap Hari</option>
                <option value="tiap 2 hari">1x Setiap 2 Hari</option>
                <option value="tiap 3 hari">1x Setiap 3 Hari</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5">
                Jam Notifikasi Reminder
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-canvas border border-surface-alt rounded-xl px-4 py-2.5 text-sm text-ink font-mono focus:outline-none focus:border-accent"
                />
                <button
                  onClick={hasNotifPermission ? sendTestNotification : handleRequestNotif}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-accent-soft hover:bg-accent/20 text-accent text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{hasNotifPermission ? 'Tes Notifikasi' : 'Izinkan Notifikasi'}</span>
                </button>
              </div>
            </div>

            {/* Grace Day Information Card */}
            <div className="bg-canvas border border-accent/20 rounded-2xl p-3.5 flex items-center gap-3">
              <Flame className="w-5 h-5 text-warning shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-ink">Grace Day Streak Aktif</div>
                <div className="text-[10px] text-ink-muted leading-tight">
                  Tersedia 1x "izin bolong" per minggu tanpa memutus streak jurnalmu.
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-accent text-canvas text-xs font-bold py-3 rounded-xl hover:scale-[1.01] transition-all shadow-md shadow-accent/15"
            >
              Simpan Setelan
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Card 2: Theme Options */}
          <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 border-b border-surface-alt/60 pb-3">
              <Sun className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Tema Tampilan</h3>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-3 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-accent/15 border-accent text-accent font-bold shadow-sm'
                    : 'bg-canvas border-surface-alt text-ink-muted hover:text-ink'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-3 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-accent/15 border-accent text-accent font-bold shadow-sm'
                    : 'bg-canvas border-surface-alt text-ink-muted hover:text-ink'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Card 3: Export & Backup Data (Tahap 11 Stretch) */}
          <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-surface-alt/60 pb-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Ekspor & Cadangan Data</h3>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink-muted text-xs leading-relaxed">
                Simpan cadangan seluruh catatan jurnal dan setelanmu ke file JSON untuk arsip pribadi.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 bg-accent-soft hover:bg-accent/20 text-accent font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-surface-alt hover:bg-surface-alt/80 text-ink font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Impor Backup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Security & Account Card */}
          <div className="bg-surface border border-surface-alt rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 border-b border-surface-alt/60 pb-3">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Akun & Keamanan</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-canvas rounded-xl">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-success" />
                  <div>
                    <div className="font-semibold text-ink">Akun Anonim Firebase</div>
                    <div className="text-[10px] text-ink-muted">Terisolasi per userId di server Firestore</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-canvas rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-accent" />
                  <div>
                    <div className="font-semibold text-ink">PWA Responsive & Installable</div>
                    <div className="text-[10px] text-ink-muted">Tampilan menyesuaikan layar HP & Desktop</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
