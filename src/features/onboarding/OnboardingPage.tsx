import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, CheckCircle2, Bell, Sparkles } from 'lucide-react';
import { RecFrequency } from '../../types';
import { WaveformDecoration } from '../../components/WaveformDecoration';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frequency, setFrequency] = useState<RecFrequency>('1x/hari');
  const [reminderTime, setReminderTime] = useState('20:00');
  const [notificationGranted, setNotificationGranted] = useState(false);
  const navigate = useNavigate();

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationGranted(true);
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    } else {
      alert('Browser ini tidak mendukung Notifikasi API.');
    }
  };

  const handleFinish = () => {
    // Simpan data preferensi ke settings store lokal
    const userSettings = {
      frequency,
      reminderTime,
      notificationGranted,
      isFirstTime: false,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('gumam_onboarded', 'true');
    localStorage.setItem('gumam_settings', JSON.stringify(userSettings));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Stepper Header */}
      <div className="pt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
          <span>Langkah {step} dari 3</span>
          <span className="text-accent font-semibold">Gumam PWA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-accent' : 'bg-surface-alt'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-accent' : 'bg-surface-alt'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-accent' : 'bg-surface-alt'}`} />
        </div>
      </div>

      {/* STEP 1: Sambutan & Pilih Frekuensi */}
      {step === 1 && (
        <div className="my-auto space-y-6 animate-fadeIn">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-accent-soft border border-accent/30 text-accent flex items-center justify-center shadow-lg shadow-accent/10">
              <Mic className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-ink leading-tight">
                Mencatat Secepat Bicara
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                Gumam merapikan rekaman suara harianmu menjadi jurnal terstruktur berbasis AI, privat, dan tanpa friksi.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono text-ink-muted uppercase tracking-wider">
              Seberapa sering kamu ingin mencatat?
            </label>
            {[
              { id: '1x/hari', label: '1x Setiap Hari', desc: 'Rekomendasi terbaik untuk refleksi malam' },
              { id: '2x/hari', label: '2x Setiap Hari', desc: 'Sesi pagi (ide) & sesi malam (recap)' },
              { id: 'tiap 2 hari', label: '1x Setiap 2 Hari', desc: 'Ritme santai untuk kesibukan padat' },
              { id: 'tiap 3 hari', label: '1x Setiap 3 Hari', desc: 'Jurnal berkala per 3 hari' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFrequency(option.id as RecFrequency)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all duration-200 ${
                  frequency === option.id
                    ? 'bg-accent-soft/60 border-accent text-ink shadow-md shadow-accent/5'
                    : 'bg-surface border-surface-alt/70 text-ink-muted hover:border-accent/40 hover:text-ink'
                }`}
              >
                <div>
                  <div className={`font-semibold text-sm ${frequency === option.id ? 'text-accent' : 'text-ink'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">{option.desc}</div>
                </div>
                {frequency === option.id && <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Atur Jam Reminder & Notifikasi */}
      {step === 2 && (
        <div className="my-auto space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-accent-soft/60 border border-accent/20 text-accent flex items-center justify-center mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Atur Jam Notifikasi
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Notifikasi ramah akan membantumu konsisten mencatat dan menjaga streak jurnal.
            </p>
          </div>

          <div className="bg-surface border border-surface-alt rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <label className="block text-xs font-mono text-ink-muted uppercase tracking-wider">
              Pilih Waktu Reminder
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-canvas border border-accent/40 rounded-2xl px-6 py-4 text-3xl font-mono text-accent text-center focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="bg-surface-alt/50 border border-surface-alt rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-ink">Izin Push Notification</div>
              <div className="text-[11px] text-ink-muted leading-tight">
                Notifikasi dikirim secara lokal langsung di browser HP kamu.
              </div>
            </div>
            <button
              onClick={handleRequestNotification}
              disabled={notificationGranted}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                notificationGranted
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-accent text-canvas hover:scale-105 active:scale-95'
              }`}
            >
              {notificationGranted ? 'Diizinkan ✓' : 'Izinkan'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Konfirmasi Siap & Value Banner */}
      {step === 3 && (
        <div className="my-auto space-y-6 animate-fadeIn text-center">
          <div className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent text-accent flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-ink">
              Kamu Siap Mencatat!
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
              Akun privat anonimmu telah disiapkan. Rekam cerita pertamamu sekarang juga.
            </p>
          </div>

          <div className="bg-surface border border-accent/20 rounded-2xl p-5 space-y-3">
            <WaveformDecoration bars={20} active={true} className="h-8" />
            <div className="text-xs font-mono text-accent font-semibold">
              Privasi Terjamin • Firestore Security Rules
            </div>
            <p className="text-[11px] text-ink-muted">
              Catatan disimpan terisolasi dan hanya dapat diakses oleh perangkat milikmu.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pb-4 pt-2">
        {step < 3 ? (
          <button
            onClick={() => setStep((prev) => (prev + 1) as 2 | 3)}
            className="w-full bg-accent text-canvas font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full bg-accent text-canvas font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
          >
            <span>Mulai Mencatat di Gumam</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
