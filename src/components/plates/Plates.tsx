'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import clsx from 'clsx';
import { getEntry, trip, SIGNALS } from '@/lib/data';
import { useOpenEntry } from '@/lib/url-state';
import { useUI } from '@/lib/store';
import { EntryPill, SourceRef } from '../ui';

/* ------------------------------------------------ 1. What a reader does */

const READERS = [
  { x: 120, label: 'Reader A', time: '08:12' },
  { x: 380, label: 'Reader B', time: '08:19' },
  { x: 640, label: 'Reader C', time: '08:31' },
];

export function ReaderDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const reduced = useUI((s) => s.reducedMotion);
  const [stage, setStage] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) return setStage(3);
    if (!inView) return;
    setStage(0);
    const ids = [1, 2, 3].map((s, i) => setTimeout(() => setStage(s), 900 + i * 1300));
    return () => ids.forEach(clearTimeout);
  }, [inView, reduced]);

  const carX = stage === 0 ? 20 : READERS[Math.min(stage, 3) - 1].x;

  return (
    <div ref={ref} className="rounded-3xl border border-line bg-ink-2/50 p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Illustration</p>
        <button type="button" onClick={() => { setStage(0); [1, 2, 3].forEach((s, i) => setTimeout(() => setStage(s), 500 + i * 1100)); }} className="text-xs text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper">
          Replay
        </button>
      </div>
      <svg viewBox="0 0 760 150" className="mt-4 w-full" aria-hidden="true">
        <line x1="0" x2="760" y1="112" y2="112" stroke="#f2eee6" strokeOpacity=".18" />
        <line x1="0" x2="760" y1="112" y2="112" stroke="#f2eee6" strokeOpacity=".25" strokeDasharray="10 14" transform="translate(0,14)" />
        {READERS.map((r, i) => {
          const fired = stage > i;
          return (
            <g key={r.label} transform={`translate(${r.x},0)`}>
              <line x1="0" x2="0" y1="34" y2="112" stroke="#f2eee6" strokeOpacity=".35" />
              <rect x="-10" y="22" width="20" height="13" rx="3" fill="#232327" stroke="#f2eee6" strokeOpacity=".5" />
              <motion.path d="M0 35 L-38 104 L38 104 Z" fill={SIGNALS.visual.color} initial={false} animate={{ opacity: fired ? 0.16 : 0.03 }} transition={{ duration: 0.4 }} />
              <text y="14" textAnchor="middle" className="fill-paper-3 font-mono text-[10px]">
                {r.label}
              </text>
            </g>
          );
        })}
        <motion.g initial={false} animate={{ x: carX }} transition={reduced ? { duration: 0 } : { duration: 1, ease: [0.65, 0, 0.35, 1] }}>
          <rect x="-26" y="92" width="52" height="18" rx="6" fill="#f2eee6" />
          <rect x="-12" y="98" width="24" height="7" rx="1.5" fill="#0b0b0c" />
        </motion.g>
      </svg>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <caption className="sr-only">Records created as the car passes three readers</caption>
          <thead>
            <tr className="border-b border-line text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3">
              <th className="py-2 font-normal">Plate</th>
              <th className="py-2 font-normal">Place</th>
              <th className="py-2 font-normal">Time</th>
            </tr>
          </thead>
          <tbody className="font-mono text-paper">
            {READERS.map((r, i) => (
              <motion.tr key={r.label} className="border-b border-line" initial={false} animate={{ opacity: stage > i ? 1 : 0.12 }} transition={{ duration: 0.4 }}>
                <td className="py-2">ABC 1234</td>
                <td className="py-2">{r.label}</td>
                <td className="py-2 tabular">{r.time}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <motion.p className="mt-5 text-[0.9375rem] leading-relaxed text-paper-2" initial={false} animate={{ opacity: stage >= 3 ? 1 : 0.35 }}>
        One read is a single observation. Retained across many readers, the same records describe a route: “searchable plate, place, and time records”
        that can produce location histories rather than only a traffic-enforcement record.
      </motion.p>
      <div className="mt-2 flex flex-wrap gap-x-4">
        <SourceRef line={39} />
        <SourceRef line={434} />
      </div>
    </div>
  );
}

/* ------------------------------------------------ 2. Road and vehicle history */

const HISTORY = [
  'speed-cameras', 'traffic-cameras', 'red-light-cameras', 'anpr-alpr', 'electronic-toll-transponders', 'vehicle-event-data-recorders',
  'connected-car-telematics-services', 'toll-plate-recognition', 'multi-camera-trajectory-reconstruction', 'parking-plate-recognition',
  'cctv-video-analytics', 'real-time-crime-centers-rtccs-and-camera-registries', 'mobile-municipal-alpr-scanning-fleets', 'location-data-brokers',
  'connected-car-data-broker-feeds', 'fixed-neighborhood-alpr-networks',
];
const PLATE_IDS = ['anpr-alpr', 'mobile-municipal-alpr-scanning-fleets', 'fixed-neighborhood-alpr-networks'];
const H0 = 1950;
const H1 = 2026;
const pos = (y: number) => ((y - H0) / (H1 - H0)) * 100;

/** Each bar runs from the spreadsheet year to today: a system does not end at its start date. */
export function RoadHistory() {
  const open = useOpenEntry();
  const list = HISTORY.map((id) => getEntry(id)).filter((e): e is NonNullable<typeof e> => !!e).sort((a, b) => a.yearNum - b.yearNum);
  return (
    <div className="rounded-3xl border border-line">
      <div className="hidden grid-cols-[minmax(12rem,18rem)_1fr_4rem] gap-4 border-b border-line px-5 py-3 text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3 md:grid">
        <span>System</span>
        <span className="relative font-mono normal-case tracking-normal">
          {[1960, 1980, 2000, 2020].map((y) => (
            <span key={y} className="absolute -translate-x-1/2" style={{ left: `${pos(y)}%` }}>
              {y}
            </span>
          ))}
          &nbsp;
        </span>
        <span className="text-right">Year</span>
      </div>
      <ul>
        {list.map((e) => {
          const plate = PLATE_IDS.includes(e.id);
          return (
            <li key={e.id} className="border-b border-line last:border-0">
              <button type="button" onClick={() => open(e.id)} className="grid w-full gap-2 px-5 py-3 text-left hover:bg-ink-2 md:grid-cols-[minmax(12rem,18rem)_1fr_4rem] md:items-center md:gap-4">
                <span className={clsx('text-sm', plate ? 'font-medium text-paper' : 'text-paper-2')}>
                  {e.name}
                  {!e.line && <span className="ml-2 font-mono text-[0.625rem] text-paper-3">spreadsheet only</span>}
                </span>
                <span className="relative h-2.5 rounded-full bg-ink-3">
                  <span
                    className="absolute top-0 h-2.5 rounded-full"
                    style={{
                      left: `${pos(e.yearNum)}%`,
                      right: 0,
                      background: `linear-gradient(to right, ${SIGNALS[e.signal].color}, ${SIGNALS[e.signal].color}${plate ? '88' : '33'})`,
                    }}
                  />
                </span>
                <span className="font-mono text-xs text-paper-2 tabular md:text-right">{e.year}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------ 3. One trip, many records */

export function OneTrip() {
  const [mode, setMode] = useState<'all' | 'seen' | 'unseen'>('all');
  const groups = [...new Set(trip.map((t) => t.where))];
  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by visibility">
        {(
          [
            ['all', 'Everything that can record the trip'],
            ['seen', 'Visible from the street'],
            ['unseen', 'Inside the car, the phone, or downstream'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={mode === k}
            onClick={() => setMode(k)}
            className={clsx('min-h-10 rounded-full border px-4 text-sm transition-colors', mode === k ? 'border-paper bg-paper text-ink' : 'border-line-2 text-paper-2 hover:text-paper')}
          >
            {l}
            <span className={clsx('ml-2 font-mono text-xs', mode === k ? 'text-ink/60' : 'text-paper-3')}>
              {trip.filter((t) => k === 'all' || (k === 'seen' ? t.visible : !t.visible)).length}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => {
          const list = trip.filter((t) => t.where === g);
          const visible = list[0].visible;
          const dim = (mode === 'seen' && !visible) || (mode === 'unseen' && visible);
          return (
            <motion.div key={g} animate={{ opacity: dim ? 0.18 : 1 }} transition={{ duration: 0.3 }}>
              <p className="eyebrow flex items-center gap-2">
                <span className={clsx('h-1.5 w-1.5 rounded-full', visible ? 'bg-paper' : 'border border-paper-2')} />
                {g}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {list.map((t) => (
                  <EntryPill key={t.id} id={t.id} showYear />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-paper-3">
        Which systems are present depends on the vehicle, the phone and its apps, and local deployment. Grouping by visibility is an editorial
        observation, not a finding of the report.
      </p>
    </div>
  );
}
