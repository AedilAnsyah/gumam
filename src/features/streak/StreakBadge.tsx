import React from 'react';
import { Activity } from 'lucide-react';

interface StreakBadgeProps {
  streakCount: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streakCount }) => {
  return (
    <div className="flex items-center gap-2 bg-surface neu-raised-sm px-3.5 py-1.5 rounded-full text-xs font-mono text-ink">
      <div className="w-5 h-5 rounded-full neu-inset-sm flex items-center justify-center text-accent">
        <Activity className="w-3 h-3 animate-pulse" />
      </div>
      <span className="font-semibold text-ink tracking-tight">{streakCount} Hari Streak</span>
    </div>
  );
};
