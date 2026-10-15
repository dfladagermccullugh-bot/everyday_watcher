'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from 'clsx';
import { day } from '@/lib/data';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { MomentFan } from './MomentFan';
import { MomentCounts, Tally } from './dayParts';

// Moments are evenly spaced so labels never collide; times stay visible as labels.
const pct = (i: number) => 4 + (i / (day.length - 1)) * 92;
// A quiet tint that follows the hour: dawn, day, dusk, night.
const TINT = ['#e8a95122', '#f2eee612', '#f2eee610', '#f2eee60e', '#f2eee60e', '#f2eee60e', '#e8a9510f', '#e58fa812', '#82a9f514', '#82a9f51a'];

/** Desktop scroll story: GSAP pins the stage and maps scroll progress to the moment. */
export default function PinnedDay() {
  const wrap = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [index, setIndex] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const n = day.length;

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({
        trigger: wrap.current,
        pin: pin.current,
        start: 'top top',
        end: () => `+=${(n - 1) * window.innerHeight * 0.8}`,
        scrub: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.5 }, delay: 0.08, ease: 'power2.inOut' },
        onUpdate: (self) => {
          const i = Math.round(self.progress * (n - 1));
          setIndex((prev) => (prev === i ? prev : i));
          bar.current?.style.setProperty('--p', String(self.progress));
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [n]);

  const jump = useCallback(
    (i: number) => {
      const t = st.current;
      if (!t) return;
      window.scrollTo({ top: t.start + (i / (n - 1)) * (t.end - t.start) + 1, behavior: 'smooth' });
    },
    [n],
  );

  // Support /#moment-<id> links from elsewhere on the site.
  useEffect(() => {
    const go = () => {
      const m = window.location.hash.match(/^#moment-(.+)$/);
      if (!m) return;
      const i = day.findIndex((d) => d.id === m[1]);
      if (i >= 0) setTimeout(() => jump(i), 60);
    };
    go();
    window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [jump]);

  const m = day[index];

  return (
    <div ref={wrap}>
      <div ref={pin} className="relative flex h-[100dvh] flex-col overflow-hidden pt-[calc(var(--nav-h)+8px)]">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10%] -top-[30%] h-[80vh] w-[70vw] rounded-full blur-3xl"
          animate={{ backgroundColor: TINT[index] }}
          transition={{ duration: 1.2 }}
        />
        <div className="mx-auto w-full max-w-[1440px] px-10">
          <DayRuler index={index} onJump={jump} barRef={bar} />
        </div>

        <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-12 items-center gap-8 px-10">
          <div className="col-span-4 self-center">
            <AnimatePresence mode="wait">
              <motion.div key={m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <p className="font-mono text-sm text-paper-3 tabular">
                  {m.time} <span className="mx-2 text-line-3">/</span> {String(index + 1).padStart(2, '0')} of {n}
                </p>
                <h3 className="mt-3 font-serif text-[3.25rem] leading-[1] text-balance">{m.title}</h3>
                <p className="mt-5 font-serif text-[1.5rem] italic leading-snug text-paper-2 text-balance">{m.line}</p>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-paper-2">{m.body}</p>
                <MomentCounts rows={m.rows} className="mt-6" />
                {m.feature === 'plates' && (
                  <Link href="/plates/" className="mt-6 inline-flex items-center gap-2 text-sm text-paper underline decoration-line-3 underline-offset-4 hover:decoration-paper">
                    The plate reader in context →
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="col-span-8 max-h-[calc(100dvh-14rem)] self-center">
            <MomentFan moment={m} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1440px] px-10 pb-6">
          <Tally upTo={index} />
        </div>
      </div>
    </div>
  );
}

function DayRuler({ index, onJump, barRef }: { index: number; onJump: (i: number) => void; barRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="relative pb-2 pt-5" role="tablist" aria-label="Moments of the day">
      <div className="absolute inset-x-0 top-[34px] h-px bg-line-2" />
      <div ref={barRef} className="absolute left-0 top-[34px] h-px bg-paper/60 [width:calc(4%_+_var(--p,0)*92%)]" />
      <div className="relative h-9">
        {day.map((d, i) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={i === index}
            onClick={() => onJump(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onJump(Math.min(day.length - 1, i + 1));
              if (e.key === 'ArrowLeft') onJump(Math.max(0, i - 1));
            }}
            className="group absolute top-0 -translate-x-1/2 px-1 text-center"
            style={{ left: `${pct(i)}%` }}
          >
            <span className={clsx('block font-mono text-[0.6875rem] tabular transition-colors', i === index ? 'text-paper' : 'text-paper-3 group-hover:text-paper-2')}>{d.time}</span>
            <span className={clsx('mx-auto mt-[7px] block h-2 w-2 rounded-full border transition-all', i === index ? 'scale-125 border-paper bg-paper' : i < index ? 'border-paper-2 bg-paper-2' : 'border-line-3 bg-ink')} />
            <span className="sr-only">{d.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

