import React from 'react';

interface WaveformDecorationProps {
  bars?: number;
  className?: string;
  active?: boolean;
}

export const WaveformDecoration: React.FC<WaveformDecorationProps> = ({
  bars = 16,
  className = '',
  active = false,
}) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        // Generate pseudo-random heights for natural waveform look
        const heights = [30, 60, 45, 80, 100, 70, 40, 90, 65, 85, 50, 75, 35, 95, 60, 40];
        const heightPct = heights[i % heights.length];
        
        return (
          <span
            key={i}
            style={{
              height: `${heightPct}%`,
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
            }}
            className={`w-1 rounded-full bg-accent/70 transition-all ${
              active ? 'animate-pulse' : ''
            }`}
          />
        );
      })}
    </div>
  );
};
