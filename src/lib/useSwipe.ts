import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from './constants';

const TAB_ORDER: string[] = [ROUTES.HOME, ROUTES.ENTRIES, ROUTES.TANYA, ROUTES.SETTINGS];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignored if browser policy blocks
      }
    }
  };

  useEffect(() => {
    // Only enable tab swipe on the 4 main tabs
    const currentIndex = TAB_ORDER.indexOf(location.pathname);
    if (currentIndex === -1) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't trigger if touching inputs, textareas, or canvas
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.tagName === 'CANVAS' ||
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('.no-swipe')
      ) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;

      // Thresholds: Minimum 60px horizontal distance, and horizontal movement must be at least 1.5x vertical movement
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          // Swipe Left -> Go to Next Tab
          if (currentIndex < TAB_ORDER.length - 1) {
            triggerHaptic();
            navigate(TAB_ORDER[currentIndex + 1]);
          }
        } else {
          // Swipe Right -> Go to Prev Tab
          if (currentIndex > 0) {
            triggerHaptic();
            navigate(TAB_ORDER[currentIndex - 1]);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname, navigate]);
}
