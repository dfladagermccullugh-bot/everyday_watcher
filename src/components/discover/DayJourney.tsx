'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { day, SCOPES, type Scope } from '@/lib/data';
import { useMediaQuery, useMounted } from '@/lib/hooks';
import { useUI } from '@/lib/store';
import { MomentFan, MomentList } from './MomentFan';
import { MomentCounts } from './dayParts';
import { ScopeGlyph } from '../ui';

// GSAP is only loaded where the pinned story runs (wide screens, motion allowed).
const PinnedDay = dynamic(() => import('./PinnedDay'), { ssr: false, loading: () => <div className="h-[100dvh]" /> });

export function DayJourney() {
  const mounted = useMounted();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const tall = useMediaQuery('(min-height: 640px)');
  const reduced = useUI((s) => s.reducedMotion);
  const pinned = mounted && desktop && tall && !reduced;

  return (
    <section id="day" aria-labelledby="day-title" className="relative">
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-24 sm:px-6 lg:px-10">
        <p className="eyebrow">Part one · An ordinary day</p>
        <h2 id="day-title" className="mt-4 max-w-3xl font-serif text-title text-balance">
          Ten moments, from the alarm to the front door.
        </h2>
        <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-paper-2 text-pretty">
          Each moment shows systems from the research that <em>can</em> collect data during that activity. Not every system applies to every person.
          Marks distinguish what is common from what depends on your devices and choices, or on where you live.
        </p>
        <ScopeKey className="mt-6" />
      </div>
      {pinned ? <PinnedDay /> : <StackedDay />}
    </section>
  );
}

function ScopeKey({ className }: { className?: string }) {
  return (
    <ul className={clsx('flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-paper-2', className)}>
      {(Object.keys(SCOPES) as Scope[]).map((s) => (
        <li key={s} className="flex items-center gap-2">
          <ScopeGlyph scope={s} size={11} />
          <span className="text-paper">{SCOPES[s].label}</span>
          <span className="hidden text-paper-3 sm:inline">— {SCOPES[s].long.toLowerCase()}</span>
        </li>
      ))}
    </ul>
  );
}

function StackedDay() {
  return (
    <ol className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      {day.map((m, i) => (
        <li key={m.id} id={`moment-${m.id}`} className="grid scroll-mt-24 gap-6 border-t border-line py-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="font-mono text-sm text-paper-3 tabular">
              {m.time} <span className="mx-2 text-line-3">/</span> {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 font-serif text-[2.4rem] leading-[1.02] sm:text-[2.8rem]">{m.title}</h3>
            <p className="mt-3 font-serif text-xl italic leading-snug text-paper-2">{m.line}</p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper-2">{m.body}</p>
            <MomentCounts rows={m.rows} className="mt-5" />
            {m.feature === 'plates' && (
              <Link href="/plates/" className="mt-5 inline-flex text-sm text-paper underline decoration-line-3 underline-offset-4">
                The plate reader in context →
              </Link>
            )}
          </div>
          <div className="lg:col-span-8">
            <div className="hidden md:block">
              <MomentFan moment={m} />
            </div>
            <div className="md:hidden">
              <MomentList moment={m} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
