import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, BookOpen, Sparkles, Settings, Activity, PlusCircle } from 'lucide-react';
import { GumamLogo } from './GumamLogo';
import { ThemeToggle } from './ThemeToggle';
import { StreakBadge } from '../features/streak/StreakBadge';
import { APP_NAME, APP_TAGLINE, COMPETITION_NAME, ROUTES } from '../lib/constants';
import { useStreak } from '../lib/useStreak';

export const DesktopSidebar: React.FC = () => {
  const { streak } = useStreak();

  const navItems = [
    { to: ROUTES.HOME, label: 'Rekam Suara', icon: Mic, desc: 'Mulai rekaman baru' },
    { to: ROUTES.ENTRIES, label: 'Daftar Catatan', icon: BookOpen, desc: 'Arsip & kalender jurnal' },
    { to: ROUTES.TANYA, label: 'Tanya AI', icon: Sparkles, desc: 'Pencarian memori natural' },
    { to: ROUTES.SETTINGS, label: 'Setelan App', icon: Settings, desc: 'Pengaturan & notifikasi' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-black/[0.04] dark:border-white/[0.04] fixed inset-y-0 left-0 z-40 p-5 justify-between">
      {/* Top Section: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-1">
          <GumamLogo size="md" animated={true} />
          <div>
            <h1 className="font-display font-bold text-xl text-ink tracking-tight">{APP_NAME}</h1>
            <p className="text-[10px] font-mono text-ink-muted">{APP_TAGLINE}</p>
          </div>
        </div>

        {/* Streak Counter Card in Neumorphic Inset Bay */}
        <div className="neu-inset rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-mono text-[11px] font-medium">Status Consistencies</span>
            <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
          </div>
          <StreakBadge streakCount={streak.currentStreak} />
        </div>

        {/* Quick Record Button */}
        <NavLink
          to={ROUTES.HOME}
          className="w-full neu-button rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-accent font-bold text-sm tracking-tight"
        >
          <PlusCircle className="w-4 h-4 text-accent" />
          <span>Rekam Jurnal Baru</span>
        </NavLink>

        {/* Navigation Items */}
        <nav className="space-y-2 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.HOME}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'neu-inset text-accent font-bold scale-[0.98]'
                      : 'text-ink-muted hover:text-ink hover:neu-raised-sm active:neu-inset-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'neu-inset-sm text-accent' : 'neu-raised-sm text-ink-muted'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm leading-tight">{item.label}</span>
                      <span className="text-[10px] font-mono text-ink-muted">{item.desc}</span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] text-xs font-mono text-ink-muted space-y-3 px-1">
        {/* Dark/Light Mode Switcher */}
        <ThemeToggle size="md" />

        <div className="flex items-center justify-between text-[11px] neu-inset-sm px-3 py-1.5 rounded-xl">
          <span>Auth Status</span>
          <span className="text-success font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
            Anonim
          </span>
        </div>
        <div className="text-[10px] text-ink-muted text-center">{COMPETITION_NAME}</div>
      </div>
    </aside>
  );
};
