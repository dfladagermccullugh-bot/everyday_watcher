'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CATEGORIES, SIGNALS, type CategoryId } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { events, PRE_END, revealYear, markKindLabel } from './model';
import { SourceRef } from '../ui';

const decadeOf = (y: number) => (y < PRE_END ? 'Before 1975' : `${Math.floor(y / 10) * 10}s`);

/** Mobile timeline: vertical, chronological, swipe-free and fully legible. */
export function TimelineList({ cats, playYear }: { cats: CategoryId[]; playYear: number | null }) {
  const { set } = useQueryState();
  const list = events.filter((ev) => ev.type === 'context' || !cats.length || cats.includes(ev.entry.category));
  const groups = new Map<string, typeof list>();
  list.forEach((ev) => {
    const k = decadeOf(ev.type === 'entry' && ev.entry.pos.kind === 'pre' ? 1964 : ev.year);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(ev);
  });
  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (playYear != null) activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [playYear]);
  const activeYear = playYear != null ? Math.floor(playYear) : null;
  let marked = false;

  return (
    <div className="mt-6">
      {[...groups.entries()].map(([decade, evs]) => (
        <section key={decade} aria-label={decade}>
          <h2 className="sticky top-[var(--nav-h)] z-10 -mx-4 border-b border-line bg-ink/90 px-4 py-2.5 font-serif text-2xl backdrop-blur-lg sm:-mx-6 sm:px-6">{decade}</h2>
          <ol className="relative ml-[3.2rem] border-l border-line-2 py-3">
            {evs.map((ev, i) => {
              const y = ev.type === 'entry' ? revealYear(ev.entry) : ev.year;
              const hidden = playYear != null && y > playYear;
              const isActive = activeYear != null && y === activeYear && !marked;
              if (isActive) marked = true;
              if (ev.type === 'context') {
                return (
                  <li key={`c${i}`} ref={isActive ? activeRef : undefined} className={clsx('relative py-2.5 pl-5 transition-opacity duration-500', hidden && 'opacity-15')}>
                    <span className="absolute -left-[3.2rem] top-3 w-10 text-right font-mono text-xs text-paper-3 tabular">{ev.year}</span>
                    <span className="absolute -left-[5px] top-[15px] h-2.5 w-2.5 rotate-45 border border-paper-2 bg-ink" />
                    <p className="text-[0.9375rem] text-paper">{ev.label}</p>
                    <SourceRef line={ev.line} className="mt-1" />
                  </li>
                );
              }
              const e = ev.entry;
              return (
                <li key={e.id} ref={isActive ? activeRef : undefined} className={clsx('relative transition-opacity duration-500', hidden && 'opacity-15')}>
                  <span className="absolute -left-[3.2rem] top-3.5 w-10 text-right font-mono text-xs text-paper-3 tabular">{e.pos.kind === 'pre' ? 'pre' : e.pos.start}</span>
                  <span
                    className={clsx('absolute -left-[5px] top-[17px] h-2.5 w-2.5 rounded-full', e.pos.kind === 'milestone' && 'border-[1.5px] bg-ink')}
                    style={e.pos.kind === 'milestone' ? { borderColor: SIGNALS[e.signal].color } : { background: SIGNALS[e.signal].color }}
                  />
                  <button type="button" onClick={() => set({ entry: e.id })} className="block w-full rounded-xl py-2.5 pl-5 pr-2 text-left active:bg-ink-2">
                    <span className="block text-[0.9375rem] leading-snug text-paper">{e.name}</span>
                    <span className="mt-0.5 block text-xs text-paper-3">
                      {CATEGORIES[e.category].short} · {markKindLabel(e)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
