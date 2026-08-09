import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Bell, Sparkles } from 'lucide-react';
import { GumamLogo } from '../../components/GumamLogo';
import { RecFrequency } from '../../types';
import { WaveformDecoration } from '../../components/WaveformDecoration';
import { APP_NAME, LS_KEY_ONBOARDED, LS_KEY_SETTINGS, DEFAULT_FREQUENCY, DEFAULT_REMINDER_TIME, ROUTES } from '../../lib/constants';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frequency, setFrequency] = useState<RecFrequency>(DEFAULT_FREQUENCY as RecFrequency);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
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
    localStorage.setItem(LS_KEY_ONBOARDED, 'true');
    localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(userSettings));
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden text-left">
      {/* Stepper Header */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
          <span className="neu-pill px-3 py-1 text-accent font-semibold">Langkah {step} dari 3</span>
          <span className="text-ink font-semibold">{APP_NAME} PWA</span>
        </div>
        <div className="flex items-center gap-2 neu-inset-sm p-1 rounded-full">
          <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-accent shadow-sm' : 'bg-transparent'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-accent shadow-sm' : 'bg-transparent'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-accent shadow-sm' : 'bg-transparent'}`} />
        </div>
      </div>

      {/* STEP 1: Sambutan & Pilih Frekuensi */}
      {step === 1 && (
        <div className="my-auto space-y-6 animate-fadeIn">
          <div className="space-y-4">
            <GumamLogo size="lg" animated={true} />

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-ink leading-tight tracking-tight">
                Mencatat Secepat Bicara
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                {APP_NAME} merapikan rekaman suara harianmu menjadi jurnal terstruktur berbasis AI, privat, dan tanpa friksi.
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
                className={`w-full p-4 rounded-2xl text-left flex items-start justify-between transition-all duration-200 cursor-pointer ${
                  frequency === option.id
                    ? 'neu-inset text-ink scale-[0.98]'
                    : 'neu-raised-sm text-ink-muted hover:text-ink'
                }`}
              >
                <div>
                  <div className={`font-semibold text-sm ${frequency === option.id ? 'text-accent font-bold' : 'text-ink'}`}>
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
            <div className="w-14 h-14 rounded-2xl neu-raised text-accent flex items-center justify-center mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
              Atur Jam Notifikasi
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Notifikasi ramah akan membantumu konsisten mencatat dan menjaga streak jurnal.
            </p>
          </div>

          <div className="neu-card p-6 text-center space-y-4">
            <label className="block text-xs font-mono text-ink-muted uppercase tracking-wider">
              Pilih Waktu Reminder
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="neu-inset rounded-2xl px-6 py-4 text-3xl font-mono text-accent text-center focus:outline-none focus:ring-1 focus:ring-accent/40 bg-transparent w-full"
            />
          </div>

          <div className="neu-card-sm p-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-ink">Izin Push Notification</div>
              <div className="text-[11px] text-ink-muted leading-tight">
                Notifikasi dikirim secara lokal langsung di browser HP kamu.
              </div>
            </div>
            <button
              onClick={handleRequestNotification}
              disabled={notificationGranted}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                notificationGranted
                  ? 'neu-inset-sm text-success'
                  : 'neu-button text-accent'
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
          <div className="w-20 h-20 rounded-full neu-raised text-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-ink tracking-tight">
              Kamu Siap Mencatat!
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
              Akun privat anonimmu telah disiapkan. Rekam cerita pertamamu sekarang juga.
            </p>
          </div>

          <div className="neu-card p-6 space-y-3 text-center">
            <WaveformDecoration bars={20} active={true} className="h-8" />
            <div className="text-xs font-mono text-accent font-bold">
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
            className="w-full neu-button text-accent font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full neu-button text-accent font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Mulai Mencatat di {APP_NAME}</span>
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </button>
        )}
      </div>
    </div>
  );
};
