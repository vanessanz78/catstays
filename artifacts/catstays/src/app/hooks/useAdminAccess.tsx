import { useState, useEffect, useCallback } from 'react';

interface UseAdminAccessProps {
  onAdminAccess: () => void;
}

export function useAdminAccess({ onAdminAccess }: UseAdminAccessProps) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle logo clicks (5 clicks within 3 seconds)
  const handleLogoClick = useCallback(() => {
    setClickCount((prev) => prev + 1);

    // Clear existing timer
    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 3000); // 3 seconds

    setClickTimer(timer);
  }, [clickTimer]);

  // Check if 5 clicks reached
  useEffect(() => {
    if (clickCount >= 5) {
      onAdminAccess();
      setClickCount(0);
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    }
  }, [clickCount, onAdminAccess, clickTimer]);

  // Handle keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        onAdminAccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAdminAccess]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  return { handleLogoClick };
}
