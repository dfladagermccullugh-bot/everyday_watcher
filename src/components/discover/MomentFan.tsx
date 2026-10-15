'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import { getEntry, SIGNALS, SCOPES, type Moment, type Scope } from '@/lib/data';
import { useOpenEntry } from '@/lib/url-state';
import { useElementSize } from '@/lib/hooks';
import { useUI } from '@/lib/store';
import { ScopeGlyph } from '../ui';

const COLS: Scope[] = ['c', 'k', 'l'];
const ROW = 31;

/**
 * Signal paths from a person to every system that can be present in one moment,
 * sorted into columns by scope. Labels never overlap because each column is a stack.
 */
export function MomentFan({ moment, compact = false }: { moment: Moment; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(ref);
  const open = useOpenEntry();
  const reduced = useUI((s) => s.reducedMotion);
  const hovered = useUI((s) => s.hovered);
  const setHovered = useUI((s) => s.setHovered);

  const groups = COLS.map((scope) => moment.rows.filter((r) => r.scope === scope));
  const maxRows = Math.max(...groups.map((g) => g.length), 1);
  const height = Math.max(maxRows * ROW + 72, compact ? 240 : 420);
  const youX = compact ? 10 : 18;
  const youY = height / 2;
  const colX = (i: number) => (compact ? 0.2 + i * 0.27 : 0.17 + i * 0.28) * width;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div key={moment.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden="true">
              {groups.map((g, ci) =>
                g.map((row, ri) => {
                  const e = getEntry(row.id)!;
                  const y = youY + (ri - (g.length - 1) / 2) * ROW;
                  const x = colX(ci);
                  const mid = youX + (x - youX) * 0.55;
                  const active = hovered === e.id;
                  return (
                    <motion.path
                      key={row.id}
                      d={`M${youX},${youY} C${mid},${youY} ${mid},${y} ${x - 8},${y}`}
                      fill="none"
                      stroke={SIGNALS[e.signal].color}
                      strokeWidth={active ? 1.6 : 1}
                      strokeOpacity={hovered && !active ? 0.12 : active ? 0.95 : 0.38}
                      strokeDasharray={row.scope === 'l' ? '3 4' : undefined}
                      initial={reduced ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.06 + ci * 0.12 + ri * 0.035, ease: [0.22, 1, 0.36, 1] }}
                    />
                  );
                }),
              )}
              <circle cx={youX} cy={youY} r={6} fill="#f2eee6" />
              <circle cx={youX} cy={youY} r={14} fill="none" stroke="#f2eee6" strokeOpacity=".2" />
            </svg>

            {groups.map((g, ci) => (
              <div key={ci}>
                {!compact && (
                  <p className="absolute flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3" style={{ left: colX(ci) - 6, top: 0 }}>
                    <ScopeGlyph scope={COLS[ci]} size={9} />
                    {SCOPES[COLS[ci]].label}
                  </p>
                )}
                {g.map((row, ri) => {
                  const e = getEntry(row.id)!;
                  const y = youY + (ri - (g.length - 1) / 2) * ROW;
                  return (
                    <motion.button
                      key={row.id}
                      type="button"
                      onClick={() => open(e.id)}
                      onMouseEnter={() => setHovered(e.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(e.id)}
                      onBlur={() => setHovered(null)}
                      className={clsx(
                        'absolute flex -translate-y-1/2 items-center gap-2 rounded-full py-1 pl-1 pr-2 text-left text-[0.8125rem] leading-tight transition-colors',
                        hovered && hovered !== e.id ? 'text-paper-3' : 'text-paper',
                        'bg-ink/70 backdrop-blur-[2px] hover:bg-ink-3',
                      )}
                      style={{ left: colX(ci) - 12, top: y, maxWidth: width * 0.27 }}
                      initial={reduced ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + ci * 0.12 + ri * 0.035 }}
                      aria-label={`${e.name}, ${SCOPES[row.scope].label}`}
                    >
                      <span className="grid h-4 w-4 shrink-0 place-items-center" style={{ color: SIGNALS[e.signal].color }}>
                        <ScopeGlyph scope={row.scope} size={10} />
                      </span>
                      <span className="truncate">{e.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/** Mobile and reduced-motion presentation: grouped, fully legible lists. */
export function MomentList({ moment }: { moment: Moment }) {
  const open = useOpenEntry();
  return (
    <div className="space-y-5">
      {COLS.map((scope) => {
        const rows = moment.rows.filter((r) => r.scope === scope);
        if (!rows.length) return null;
        return (
          <div key={scope}>
            <p className="flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3">
              <ScopeGlyph scope={scope} size={9} />
              {SCOPES[scope].label}
              <span className="font-mono tabular">{rows.length}</span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {rows.map((r) => {
                const e = getEntry(r.id)!;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => open(e.id)}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-2 bg-ink-2 px-3 text-left text-[0.8125rem] text-paper active:bg-ink-3"
                    >
                      <span style={{ color: SIGNALS[e.signal].color }}>
                        <ScopeGlyph scope={r.scope} size={10} />
                      </span>
                      {e.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
