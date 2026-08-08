import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, BookOpen, Sparkles, Settings, Activity, PlusCircle } from 'lucide-react';
import { StreakBadge } from '../features/streak/StreakBadge';

export const DesktopSidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Rekam Suara', icon: Mic, desc: 'Mulai rekaman baru' },
    { to: '/entries', label: 'Daftar Catatan', icon: BookOpen, desc: 'Arsip & kalender jurnal' },
    { to: '/tanya', label: 'Tanya AI', icon: Sparkles, desc: 'Pencarian memori natural' },
    { to: '/settings', label: 'Setelan App', icon: Settings, desc: 'Pengaturan & notifikasi' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-surface-alt/70 fixed inset-y-0 left-0 z-40 p-5 justify-between shadow-xl">
      {/* Top Section: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-accent-soft border border-accent/30 text-accent flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-ink tracking-tight">Gumam</h1>
            <p className="text-[10px] font-mono text-ink-muted">Voice Journaling AI</p>
          </div>
        </div>

        {/* Streak Counter Card */}
        <div className="bg-canvas border border-accent/20 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-mono text-[11px]">Status Consistencies</span>
            <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
          </div>
          <StreakBadge streakCount={12} />
        </div>

        {/* Quick Record Button */}
        <NavLink
          to="/"
          className="w-full bg-accent text-canvas font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-accent/20 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Rekam Jurnal Baru</span>
        </NavLink>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-soft/60 text-accent border border-accent/30 font-semibold shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-alt/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : 'text-ink-muted'}`} />
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
      <div className="pt-4 border-t border-surface-alt/60 text-xs font-mono text-ink-muted space-y-1 px-2">
        <div className="flex items-center justify-between text-[11px]">
          <span>Firestore Auth</span>
          <span className="text-success font-semibold">Anonim Active</span>
        </div>
        <div className="text-[10px] text-ink-muted/80">BitsMikro VibeCode 2026</div>
      </div>
    </aside>
  );
};
