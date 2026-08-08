import React from 'react';
import { StreakBadge } from '../features/streak/StreakBadge';
import { APP_NAME } from '../lib/constants';
import { useStreak } from '../lib/useStreak';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = APP_NAME }) => {
  const { streak } = useStreak();

  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-md border-b border-surface-alt/40 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-ink tracking-tight">
            {title}
          </span>
        </div>
        <StreakBadge streakCount={streak.currentStreak} />
      </div>
    </header>
  );
};
