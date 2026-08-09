import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('gumam_theme') as ThemeMode) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark');
      } else {
        root.setAttribute('data-theme', 'light');
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('gumam_theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
