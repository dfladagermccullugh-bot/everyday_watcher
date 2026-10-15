'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { entries, SIGNALS, SIGNAL_ORDER, type SignalId } from '@/lib/data';
import { useOpenEntry } from '@/lib/url-state';
import { useUI } from '@/lib/store';

const SIZE = 640;
const C = SIZE / 2;

/**
 * Every documented system as one point, arranged in rings by signal type around the
 * person at the center. Nothing here is random: position follows inventory order.
 */
export function SensorField() {
  const open = useOpenEntry();
  const reduced = useUI((s) => s.reducedMotion);
  const [hover, setHover] = useState<string | null>(null);
  const [ring, setRing] = useState<SignalId | null>(null);

  const rings = useMemo(() => {
    const order: SignalId[] = ['body', 'audio', 'visual', 'radio', 'sensor', 'transaction', 'network', 'derived'];
    return order.map((sig, i) => {
      const members = entries.filter((e) => e.signal === sig);
      const r = 62 + i * 31;
      const offset = i * 0.37;
      return {
        sig,
        r,
        points: members.map((e, j) => {
          const a = offset + (j / members.length) * Math.PI * 2;
          return { e, x: C + Math.cos(a) * r, y: C + Math.sin(a) * r };
        }),
      };
    });
  }, []);

  const hovered = hover ? entries.find((e) => e.id === hover) : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full overflow-visible" role="group" aria-label="All 292 documented systems arranged in rings by signal type">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2eee6" stopOpacity=".18" />
            <stop offset="100%" stopColor="#f2eee6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={58} fill="url(#core)" />
        {rings.map((ring_, i) => (
          <motion.g
            key={ring_.sig}
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: ring && ring !== ring_.sig ? 0.18 : 1, scale: 1 }}
            transition={{ duration: 0.9, delay: reduced ? 0 : 0.25 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${C}px ${C}px` }}
          >
            <circle cx={C} cy={C} r={ring_.r} fill="none" stroke="#f2eee6" strokeOpacity=".06" />
            {ring_.points.map(({ e, x, y }) => {
              const active = hover === e.id;
              return (
                <g key={e.id}>
                  {active && <line x1={C} y1={C} x2={x} y2={y} stroke={SIGNALS[e.signal].color} strokeOpacity=".5" strokeWidth="1" />}
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 5.5 : 3.1}
                    fill={SIGNALS[e.signal].color}
                    className="cursor-pointer transition-[r] duration-200"
                    onMouseEnter={() => setHover(e.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => open(e.id)}
                  >
                    <title>{e.name}</title>
                  </circle>
                </g>
              );
            })}
          </motion.g>
        ))}
        <circle cx={C} cy={C} r={5} fill="#f2eee6" />
        {!reduced && <circle cx={C} cy={C} r={5} fill="none" stroke="#f2eee6" className="animate-ping-soft" style={{ transformOrigin: `${C}px ${C}px` }} />}
        <text x={C} y={C + 24} textAnchor="middle" className="fill-paper-2 font-mono text-[11px] tracking-[0.18em]">
          YOU
        </text>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center" aria-live="polite">
        {hovered && (
          <p className="rounded-full border border-line-2 bg-ink-3/90 px-3 py-1 text-xs text-paper backdrop-blur">
            {hovered.name} <span className="text-paper-3">· {SIGNALS[hovered.signal].label}</span>
          </p>
        )}
      </div>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1.5" aria-label="Signal types">
        {SIGNAL_ORDER.map((s) => (
          <li key={s}>
            <button
              type="button"
              onMouseEnter={() => setRing(s)}
              onMouseLeave={() => setRing(null)}
              onFocus={() => setRing(s)}
              onBlur={() => setRing(null)}
              className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[0.75rem] text-paper-2 hover:text-paper"
              title={SIGNALS[s].hint}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: SIGNALS[s].color }} />
              {SIGNALS[s].label}
              <span className="font-mono text-[0.6875rem] text-paper-3 tabular">{entries.filter((e) => e.signal === s).length}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
