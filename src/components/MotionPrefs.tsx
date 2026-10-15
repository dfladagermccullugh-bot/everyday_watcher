'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { useUI } from '@/lib/store';

/** Mirrors the OS reduced-motion preference into shared state. */
export function MotionPrefs() {
  const set = useUI((s) => s.setReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => set(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [set]);
  return null;
}

export function ReducedMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
