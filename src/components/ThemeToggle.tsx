import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (size === 'sm') {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle Dark/Light Mode"
        title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
        className={`w-9 h-9 rounded-xl neu-button flex items-center justify-center text-ink-muted hover:text-accent active:neu-inset-sm transition-all cursor-pointer ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-warning animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-accent" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark/Light Mode"
      title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      className={`w-full flex items-center justify-between neu-button px-3.5 py-2.5 rounded-2xl text-xs font-mono transition-all cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <div className="w-6 h-6 rounded-full neu-inset-sm flex items-center justify-center text-warning">
            <Sun className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full neu-inset-sm flex items-center justify-center text-accent">
            <Moon className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="text-ink font-semibold">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      <div className="neu-inset-sm px-2 py-0.5 rounded-full text-[10px] text-ink-muted font-medium">
        {isDark ? 'Aktif' : 'Aktif'}
      </div>
    </button>
  );
};
