import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { PageSkeleton } from './components/PageSkeleton';
import { initAnonymousAuth, syncLocalSettingsToFirestore } from './lib/firebase';
import { scheduleLocalReminder } from './lib/notifications';
import { useSwipeNavigation } from './lib/useSwipe';
import { ROUTES, PAGE_TITLES, LS_KEY_ONBOARDED, COMPETITION_NAME } from './lib/constants';

// Lazy Loaded Routes for Optimized Performance & Code Splitting
const RecordPage = lazy(() =>
  import('./features/recording/RecordPage').then((m) => ({ default: m.RecordPage }))
);
const EntriesPage = lazy(() =>
  import('./features/entries/EntriesPage').then((m) => ({ default: m.EntriesPage }))
);
const EntryDetailPage = lazy(() =>
  import('./features/entries/EntryDetailPage').then((m) => ({ default: m.EntryDetailPage }))
);
const SearchAskPage = lazy(() =>
  import('./features/search/SearchAskPage').then((m) => ({ default: m.SearchAskPage }))
);
const SettingsPage = lazy(() =>
  import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const OnboardingPage = lazy(() =>
  import('./features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboarding = location.pathname === ROUTES.ONBOARDING;

  // Enable Touch Gestures on Mobile (Swipe between tabs with haptic feedback)
  useSwipeNavigation();

  useEffect(() => {
    // Inisialisasi Firebase Anonymous Auth secara transparan di background
    initAnonymousAuth()
      .then((user) => {
        syncLocalSettingsToFirestore(user.uid);
      })
      .catch((err) => {
        console.warn('Firebase Auth fallback/offline mode active:', err);
      });

    scheduleLocalReminder();

    // Otomatis arahkan ke onboarding jika pengguna pertama kali membuka app
    const onboarded = localStorage.getItem(LS_KEY_ONBOARDED);
    if (!onboarded && location.pathname !== ROUTES.ONBOARDING) {
      navigate(ROUTES.ONBOARDING, { replace: true });
    }
  }, [location.pathname, navigate]);

  if (isOnboarding) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <OnboardingPage />
      </Suspense>
    );
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
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-canvas/90 backdrop-blur-md border-b border-black/[0.03] dark:border-white/[0.03] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-bold text-xl text-ink tracking-tight">
              {PAGE_TITLES[location.pathname] ||
                (location.pathname.startsWith(ROUTES.ENTRIES) && PAGE_TITLES[ROUTES.ENTRIES]) ||
                ''}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-ink-muted">
            <span className="neu-pill px-4 py-1.5 font-semibold text-[11px]">
              {COMPETITION_NAME}
            </span>
          </div>
        </header>

        {/* Main Content Area with Lazy Loading Suspense & Swipe Transition */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto transition-opacity duration-200">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<RecordPage />} />
              <Route path={ROUTES.ENTRIES} element={<EntriesPage />} />
              <Route path={ROUTES.ENTRY_DETAIL} element={<EntryDetailPage />} />
              <Route path={ROUTES.TANYA} element={<SearchAskPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Routes>
          </Suspense>
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
