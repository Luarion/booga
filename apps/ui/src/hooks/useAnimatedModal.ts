'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const UNMOUNT_DELAY_MS = 260;

/**
 * Manages the mount/open/close/unmount lifecycle for animated modals.
 *
 * - `mounted`: whether the modal DOM should exist (for animation exit)
 * - `isOpen`: drives the CSS transition classes (open vs closing)
 * - `open()`: mounts + opens in one step
 * - `close()`: starts close animation, then unmounts after delay
 *
 * Also registers an Escape key listener while the modal is mounted.
 */
export function useAnimatedModal(options?: { onAfterClose?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    clearTimer();
    setMounted(true);
    setIsOpen(true);
  }, [clearTimer]);

  const close = useCallback(() => {
    setIsOpen(false);
    clearTimer();
    timerRef.current = setTimeout(() => {
      setMounted(false);
      timerRef.current = null;
      options?.onAfterClose?.();
    }, UNMOUNT_DELAY_MS);
  }, [clearTimer, options]);

  // Escape key listener
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, mounted]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  return { mounted, isOpen, open, close } as const;
}
