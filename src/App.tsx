import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { RecordPage } from './features/recording/RecordPage';
import { EntriesPage } from './features/entries/EntriesPage';
import { EntryDetailPage } from './features/entries/EntryDetailPage';
import { SearchAskPage } from './features/search/SearchAskPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { initAnonymousAuth, syncLocalSettingsToFirestore } from './lib/firebase';
import { scheduleLocalReminder } from './lib/notifications';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboarding = location.pathname === '/onboarding';

  useEffect(() => {
    // Inisialisasi Firebase Anonymous Auth secara transparan di background
    initAnonymousAuth().then((user) => {
      syncLocalSettingsToFirestore(user.uid);
    }).catch((err) => {
      console.warn("Firebase Auth fallback/offline mode active:", err);
    });

    scheduleLocalReminder();

    // Otomatis arahkan ke onboarding jika pengguna pertama kali membuka app
    const onboarded = localStorage.getItem('gumam_onboarded');
    if (!onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [location.pathname, navigate]);

  if (isOnboarding) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row relative selection:bg-accent-soft selection:text-ink">
      {/* Sidebar Khusus Tampilan Desktop (md & ke atas) */}
      <DesktopSidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full transition-all">
        {/* Header Mobile (md:hidden) */}
        <div className="md:hidden">
          <Header />
        </div>

        {/* Desktop Top Header Bar (hidden di mobile) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-canvas/80 backdrop-blur-md border-b border-surface-alt/40 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-xl text-ink">
              {location.pathname === '/' && 'Studio Rekaman Voice Journal'}
              {location.pathname.startsWith('/entries') && 'Daftar Catatan & Kalender'}
              {location.pathname === '/tanya' && 'Tanya AI (Natural Language Search)'}
              {location.pathname === '/settings' && 'Setelan Aplikasi'}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-ink-muted">
            <span className="bg-surface border border-surface-alt px-3 py-1.5 rounded-xl">
              BitsMikro Innovative VibeCode 2026
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<RecordPage />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/entries/:id" element={<EntryDetailPage />} />
            <Route path="/tanya" element={<SearchAskPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Bottom Nav Bar Mobile (md:hidden) */}
        <div className="md:hidden">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
