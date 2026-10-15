'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { getEntry, entries } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { useUI } from '@/lib/store';
import { EntryDetail } from './EntryDetail';

/** Global detail panel driven by ?entry=. Opening pushes history so Back closes it. */
export function EntryDrawer() {
  const { get, set } = useQueryState();
  const id = get('entry');
  const entry = getEntry(id);
  const reduced = useUI((s) => s.reducedMotion);
  const scroller = useRef<HTMLDivElement>(null);
  const [isDesktop, setDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const u = () => setDesktop(mq.matches);
    u();
    mq.addEventListener('change', u);
    return () => mq.removeEventListener('change', u);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [id]);

  const idx = entry ? entries.findIndex((e) => e.id === entry.id) : -1;
  const go = (d: number) => {
    const next = entries[(idx + d + entries.length) % entries.length];
    set({ entry: next.id }, 'replace');
  };

  const initial = reduced ? { opacity: 0 } : isDesktop ? { x: '100%' } : { y: '100%' };

  return (
    <Dialog.Root open={!!entry} onOpenChange={(o) => !o && set({ entry: null })}>
      <AnimatePresence>
        {entry && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-[3px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onOpenAutoFocus={(ev) => {
                ev.preventDefault();
                scroller.current?.focus({ preventScroll: true });
              }}
            >
              <motion.div
                className="fixed z-[71] flex flex-col border-line-2 bg-ink-2 shadow-[0_0_80px_rgba(0,0,0,.6)] outline-none max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92dvh] max-md:rounded-t-3xl max-md:border-t md:inset-y-0 md:right-0 md:w-[min(680px,92vw)] md:border-l"
                initial={initial}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={initial}
                transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 0.9 }}
                onKeyDown={(ev) => {
                  if (ev.target instanceof HTMLInputElement) return;
                  if (ev.key === 'ArrowRight' && ev.altKey) go(1);
                  if (ev.key === 'ArrowLeft' && ev.altKey) go(-1);
                }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 md:px-8">
                  <div className="mx-auto h-1 w-10 rounded-full bg-line-3 md:hidden" aria-hidden="true" />
                  <div className="hidden items-center gap-1 md:flex">
                    <button type="button" onClick={() => go(-1)} className="grid h-9 w-9 place-items-center rounded-full text-paper-2 hover:bg-ink-4 hover:text-paper" aria-label="Previous entry (Alt + Left)">
                      ←
                    </button>
                    <button type="button" onClick={() => go(1)} className="grid h-9 w-9 place-items-center rounded-full text-paper-2 hover:bg-ink-4 hover:text-paper" aria-label="Next entry (Alt + Right)">
                      →
                    </button>
                    <span className="ml-2 font-mono text-xs text-paper-3 tabular">
                      {idx + 1} / {entries.length}
                    </span>
                  </div>
                  <Dialog.Close className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 text-paper-2 hover:text-paper max-md:absolute max-md:right-4 max-md:top-3" aria-label="Close details">
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sr-only">{entry.name}</Dialog.Title>
                <div ref={scroller} tabIndex={-1} className="flex-1 overflow-y-auto outline-none overscroll-contain px-5 pb-12 pt-6 md:px-8 md:pt-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                      <EntryDetail entry={entry} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
