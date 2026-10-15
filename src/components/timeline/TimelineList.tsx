'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CATEGORIES, SIGNALS, type CategoryId } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { events, PRE_END, otherMilestones } from './model';
import { SourceRef } from '../ui';

const decadeOf = (y: number) => (y < PRE_END ? 'Before 1975' : `${Math.floor(y / 10) * 10}s`);

/** Mobile timeline: vertical, chronological, and fully legible without hover. */
export function TimelineList({ cats, playYear }: { cats: CategoryId[]; playYear: number | null }) {
  const { set } = useQueryState();
  const list = events.filter((ev) => ev.type === 'context' || !cats.length || cats.includes(ev.entry.category));
  const groups = new Map<string, typeof list>();
  list.forEach((ev) => {
    const k = decadeOf(ev.year);
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
          <h2 className="sticky top-[var(--nav-h)] z-10 -mx-4 flex items-baseline justify-between border-b border-line bg-ink/90 px-4 py-2.5 font-serif text-2xl backdrop-blur-lg sm:-mx-6 sm:px-6">
            {decade}
            <span className="font-mono text-xs text-paper-3">{evs.filter((e) => e.type === 'entry').length}</span>
          </h2>
          <ol className="relative ml-[3.2rem] border-l border-line-2 py-3">
            {evs.map((ev, i) => {
              const hidden = playYear != null && ev.year > playYear;
              const isActive = activeYear != null && ev.year >= activeYear && !marked;
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
              const ms = otherMilestones(e);
              return (
                <li key={e.id} ref={isActive ? activeRef : undefined} className={clsx('cv-auto relative transition-opacity duration-500 [contain-intrinsic-size:auto_64px]', hidden && 'opacity-15')}>
                  <span className="absolute -left-[3.2rem] top-3.5 w-10 text-right font-mono text-xs text-paper-3 tabular">{e.year}</span>
                  <span className="absolute -left-[5px] top-[17px] h-2.5 w-2.5 rounded-full" style={{ background: SIGNALS[e.signal].color }} />
                  <button type="button" onClick={() => set({ entry: e.id })} className="block w-full rounded-xl py-2.5 pl-5 pr-2 text-left active:bg-ink-2">
                    <span className="block text-[0.9375rem] leading-snug text-paper">{e.name}</span>
                    <span className="mt-0.5 block text-xs text-paper-3">
                      {CATEGORIES[e.category].short}
                      {ms.length > 0 && ` · report milestone ${ms.map((m) => m.year).join(', ')}`}
                      {e.reportDating && !e.reportDating.agrees && ` · report dates it ${e.reportDating.value}`}
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
