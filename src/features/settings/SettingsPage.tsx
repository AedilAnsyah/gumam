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
          <span className="neu-pill px-4 py-1.5 text-xs font-mono text-success font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Setelan Tersimpan!
          </span>
        )}
      </div>

      {/* Grid Responsif Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Frekuensi & Reminder */}
        <div className="neu-card p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
            <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-ink">Frekuensi & Reminder</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-2">
                Target Frekuensi Mencatat
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecFrequency)}
                className="w-full neu-inset rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent cursor-pointer"
              >
                <option value="1x/hari">1x Setiap Hari</option>
                <option value="2x/hari">2x Setiap Hari</option>
                <option value="tiap 2 hari">1x Setiap 2 Hari</option>
                <option value="tiap 3 hari">1x Setiap 3 Hari</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-muted mb-2">
                Jam Notifikasi Reminder
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="neu-inset rounded-2xl px-4 py-3 text-sm text-ink font-mono focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent"
                />
                <button
                  onClick={hasNotifPermission ? sendTestNotification : handleRequestNotif}
                  className="flex-1 neu-button text-accent text-xs font-semibold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{hasNotifPermission ? 'Tes Notifikasi' : 'Izinkan Notifikasi'}</span>
                </button>
              </div>
            </div>

            {/* Grace Day Information Card */}
            <div className="neu-inset rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full neu-raised-sm flex items-center justify-center text-warning shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-ink">Grace Day Streak Aktif</div>
                <div className="text-[11px] text-ink-muted leading-tight mt-0.5">
                  Tersedia 1x "izin bolong" per minggu tanpa memutus streak jurnalmu.
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full neu-button text-accent text-xs font-bold py-3.5 rounded-2xl cursor-pointer"
            >
              Simpan Setelan
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Card 2: Theme Options (Neumorphic Segmented Control) */}
          <div className="neu-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <Sun className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-ink">Tema Tampilan</h3>
            </div>
            
            <div className="flex neu-inset-sm rounded-2xl p-1.5 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'neu-raised text-accent font-bold scale-[1.02]'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'neu-raised text-accent font-bold scale-[1.02]'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Card 3: Export & Backup Data */}
          <div className="neu-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-ink">Ekspor & Cadangan Data</h3>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink-muted text-xs leading-relaxed">
                Simpan cadangan seluruh catatan jurnal dan setelanmu ke file JSON untuk arsip pribadi.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleExport}
                  className="flex-1 neu-button text-accent font-semibold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 neu-button text-ink-muted hover:text-ink font-semibold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Backup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Security & Account Card */}
          <div className="neu-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
              <div className="w-7 h-7 rounded-full neu-inset-sm flex items-center justify-center text-accent">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-ink">Akun & Keamanan</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-4 neu-inset-sm rounded-2xl">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-success" />
                  <div>
                    <div className="font-bold text-ink">Akun Anonim Firebase</div>
                    <div className="text-[10px] text-ink-muted font-mono">Terisolasi per userId di Firestore</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 neu-inset-sm rounded-2xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-accent" />
                  <div>
                    <div className="font-bold text-ink">PWA Responsive & Installable</div>
                    <div className="text-[10px] text-ink-muted font-mono">Tampilan Soft Neumorphic UI</div>
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
