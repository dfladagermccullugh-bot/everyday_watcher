'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { day, getEntry, SIGNALS, SCOPES, type Scope } from '@/lib/data';
import { ScopeGlyph } from '../ui';

export function MomentCounts({ rows, className }: { rows: { id: string; scope: Scope }[]; className?: string }) {
  return (
    <dl className={clsx('flex gap-6', className)}>
      {(['c', 'k', 'l'] as Scope[]).map((s) => (
        <div key={s}>
          <dt className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-paper-3">
            <ScopeGlyph scope={s} size={9} />
            {SCOPES[s].label}
          </dt>
          <dd className="mt-1 font-mono text-2xl text-paper tabular">{rows.filter((r) => r.scope === s).length}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Running count of distinct system types met so far. */
export function Tally({ upTo }: { upTo: number }) {
  const seen = useMemo(() => {
    const map = new Map<string, Scope>();
    day.slice(0, upTo + 1).forEach((m) => m.rows.forEach((r) => !map.has(r.id) && map.set(r.id, r.scope)));
    return [...map.entries()];
  }, [upTo]);
  return (
    <div className="flex items-end justify-between gap-8 border-t border-line pt-4">
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] text-paper-2">
          <span className="font-mono text-paper tabular">{seen.length}</span> distinct system types can be present by {day[upTo].time}
        </p>
        <div className="mt-2 flex flex-wrap gap-[3px]" aria-hidden="true">
          {seen.map(([id]) => (
            <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className="h-[7px] w-[7px] rounded-full" style={{ background: SIGNALS[getEntry(id)!.signal].color }} />
          ))}
        </div>
      </div>
      <p className="max-w-[18rem] text-right text-[0.6875rem] leading-snug text-paper-3">Possible system types from the research, not a measurement of any person’s day.</p>
    </div>
  );
}

