import React from 'react';
import { Activity } from 'lucide-react';

interface StreakBadgeProps {
  streakCount: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streakCount }) => {
  return (
    <div className="flex items-center gap-2 bg-surface-alt/70 border border-accent/20 px-3 py-1.5 rounded-full text-xs font-medium text-accent shadow-sm backdrop-blur-sm">
      {/* Waveform icon as signature element */}
      <Activity className="w-4 h-4 text-accent animate-pulse" />
      <span className="font-mono text-ink font-semibold">{streakCount} Hari Streak</span>
    </div>
  );
};
