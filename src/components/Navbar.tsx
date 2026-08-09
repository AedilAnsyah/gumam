import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, BookOpen, Sparkles, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Rekam', icon: Mic },
    { to: '/entries', label: 'Catatan', icon: BookOpen },
    { to: '/tanya', label: 'Tanya', icon: Sparkles },
    { to: '/settings', label: 'Setelan', icon: Settings },
  ];

  const handleTabClick = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignored
      }
    }
  };

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto bg-surface neu-raised-lg rounded-3xl p-2 flex items-center justify-between border border-white/50 dark:border-white/5 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={handleTabClick}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'neu-inset text-accent font-bold scale-[0.96]'
                    : 'text-ink-muted hover:text-ink hover:neu-raised-sm active:neu-inset-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-accent scale-110' : 'text-ink-muted'}`} />
                  <span className="text-[11px] font-mono tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
