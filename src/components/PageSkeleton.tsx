import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse py-2">
      {/* Top Header Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-48 neu-card rounded-2xl" />
        <div className="h-10 w-28 neu-pill rounded-full" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="neu-card p-8 space-y-4 min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full neu-inset flex items-center justify-center text-accent">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="h-4 w-40 neu-inset-sm rounded-full" />
        <div className="h-3 w-64 neu-inset-sm rounded-full opacity-60" />
      </div>

      {/* Lower Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 neu-card rounded-3xl" />
        <div className="h-32 neu-card rounded-3xl" />
      </div>
    </div>
  );
};
