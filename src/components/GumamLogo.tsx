import React from 'react';

interface GumamLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export const GumamLogo: React.FC<GumamLogoProps> = ({
  size = 'md',
  className = '',
  animated = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10 rounded-2xl',
    md: 'w-14 h-14 rounded-3xl',
    lg: 'w-20 h-20 rounded-3xl',
    xl: 'w-28 h-28 rounded-3xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-surface neu-raised select-none shrink-0 overflow-hidden transition-all duration-200 ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FA8B5" />
            <stop offset="100%" stopColor="#31727D" />
          </linearGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="41" cy="43" r="20" fill="var(--color-accent)" opacity="0.18" />

        {/* Soundwave Ripple Arcs */}
        <g
          stroke="url(#logoTealGrad)"
          strokeLinecap="round"
          fill="none"
          className={animated ? 'animate-pulse' : ''}
        >
          {/* Ripple 1 */}
          <path d="M 58 36 A 11 11 0 0 1 58 52" strokeWidth="3.5" opacity="0.95" />
          {/* Ripple 2 */}
          <path d="M 67 29 A 20 20 0 0 1 67 59" strokeWidth="4" opacity="0.8" />
          {/* Ripple 3 */}
          <path d="M 76 22 A 29 29 0 0 1 76 66" strokeWidth="4.5" opacity="0.6" />
        </g>

        {/* Letter 'g' Monogram Path */}
        <g stroke="var(--color-ink)" strokeLinecap="round" strokeLinejoin="round">
          {/* Top circle loop of 'g' */}
          <circle
            cx="40"
            cy="41"
            r="13.5"
            strokeWidth="5.5"
            className="transition-colors"
          />

          {/* Stem & Descender Curve */}
          <path
            d="M 53.5 27.5 L 53.5 56 C 53.5 68 45 74 34 74 C 25 74 21 70 20 66"
            strokeWidth="5.5"
            className="transition-colors"
          />
        </g>

        {/* Inner Teal Core Dot */}
        <circle cx="40" cy="41" r="4" fill="var(--color-accent)" />
      </svg>
    </div>
  );
};
