'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/data';
import { unplaced } from './model';
import { EntryPill } from '../ui';

export function Unplaced() {
  const [open, setOpen] = useState(false);
  const unknown = unplaced.filter((e) => e.year === 'unknown');
  return (
    <section aria-labelledby="unplaced" className="mt-16 border-t border-line pt-10">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="unplaced" className="font-serif text-[2rem] leading-tight">
            {unplaced.length} systems are not on this timeline.
          </h2>
        </div>
        <div className="space-y-3 text-[0.9375rem] leading-relaxed text-paper-2 lg:col-span-7">
          <p>
            {unknown.length} are recorded as <span className="font-mono text-paper">unknown</span> in the CSV. The other {unplaced.length - unknown.length} have
            no year in the supplied files: the CSV that held their values was not attached, and the report gives no date for them.
          </p>
          <p>They are no less present today. They are left off rather than given a guessed date.</p>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-sm text-paper hover:border-line-3"
          >
            {open ? 'Hide' : 'Show'} undated systems
            <span aria-hidden="true" className={clsx('transition-transform', open && 'rotate-180')}>
              ↓
            </span>
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_ORDER.map((c) => {
            const list = unplaced.filter((e) => e.category === c);
            if (!list.length) return null;
            return (
              <div key={c}>
                <h3 className="eyebrow">
                  {CATEGORIES[c].label} · {list.length}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {list.map((e) => (
                    <EntryPill key={e.id} id={e.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
