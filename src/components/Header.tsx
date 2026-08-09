import { GumamLogo } from './GumamLogo';
import { StreakBadge } from '../features/streak/StreakBadge';
import { ThemeToggle } from './ThemeToggle';
import { APP_NAME } from '../lib/constants';
import { useStreak } from '../lib/useStreak';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = APP_NAME }) => {
  const { streak } = useStreak();

  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md px-4 py-3 border-b border-black/[0.03] dark:border-white/[0.03]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GumamLogo size="sm" />
          <span className="font-display font-bold text-lg text-ink tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StreakBadge streakCount={streak.currentStreak} />
          <ThemeToggle size="sm" />
        </div>
      </div>
    </header>
  );
};
