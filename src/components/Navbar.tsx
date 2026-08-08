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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-alt/70 px-4 py-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-1.5 px-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent font-semibold bg-accent-soft/50 shadow-inner scale-105 border border-accent/30'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-alt/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-2 w-6 h-1 bg-accent rounded-full shadow-sm shadow-accent/50" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-ink-muted'}`} />
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

