'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import { flows, STAGES } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { useUI } from '@/lib/store';
import { BasisBadge, EntryPill, SourceRef } from '../ui';

const STAGE_KEYS = Object.keys(STAGES) as (keyof typeof STAGES)[];

export function FollowTheData() {
  const { get, set } = useQueryState();
  const flow = flows.find((f) => f.id === get('flow')) ?? flows[0];
  const [step, setStep] = useState(0);
  const reduced = useUI((s) => s.reducedMotion);

  useEffect(() => setStep(0), [flow.id]);

  return (
    <div className="mt-12">
      <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {STAGE_KEYS.map((k, i) => (
          <div key={k} className="bg-ink p-4">
            <dt className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3">
              <span className="text-paper">{String(i + 1).padStart(2, '0')}</span> {STAGES[k].label}
            </dt>
            <dd className="mt-1.5 text-sm text-paper-2">{STAGES[k].long}</dd>
          </div>
        ))}
      </dl>

      <div className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Choose a journey">
        {flows.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={f.id === flow.id}
            onClick={() => set({ flow: f.id })}
            className={clsx(
              'min-h-10 shrink-0 rounded-full border px-4 text-sm transition-colors',
              f.id === flow.id ? 'border-paper bg-paper text-ink' : 'border-line-2 text-paper-2 hover:border-line-3 hover:text-paper',
            )}
          >
            {f.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={flow.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="mt-10" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-serif text-title">{flow.title}</h2>
              <p className="mt-3 font-serif text-xl italic text-paper-2">{flow.lede}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="min-h-11 rounded-full border border-line-2 px-5 text-sm text-paper-2 hover:text-paper disabled:opacity-35">
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))}
                className="min-h-11 rounded-full bg-paper px-6 text-sm font-medium text-ink"
              >
                {step >= 3 ? 'Start again' : `Next: ${STAGES[STAGE_KEYS[step + 1]].label}`}
              </button>
            </div>
          </div>

          <div className="relative mt-10">
            {/* Signal path with a moving packet */}
            <div className="absolute left-[11px] top-3 h-[calc(100%-24px)] w-px bg-line-2 md:left-0 md:top-[11px] md:h-px md:w-full" aria-hidden="true" />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 top-[11px] hidden h-px bg-paper md:block"
              initial={false}
              animate={{ width: `calc(${step} * (100% + 1.25rem) / 4)` }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              aria-hidden="true"
              className="absolute top-[7px] z-10 ml-[34px] hidden h-[9px] w-[9px] rounded-full bg-sig-visual shadow-[0_0_0_6px_rgba(232,169,81,.15)] md:block"
              initial={false}
              animate={{ left: `calc(${step} * (100% + 1.25rem) / 4)` }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <ol className="grid gap-5 md:grid-cols-4">
              {flow.steps.map((s, i) => {
                const active = i === step;
                const past = i < step;
                return (
                  <li key={i} className="relative pl-9 md:pl-0 md:pt-10">
                    <span
                      className={clsx(
                        'absolute left-0 top-0 grid h-[23px] w-[23px] place-items-center rounded-full border font-mono text-[0.625rem] transition-colors duration-300 md:top-0',
                        active ? 'border-paper bg-paper text-ink' : past ? 'border-paper-2 bg-ink text-paper-2' : 'border-line-3 bg-ink text-paper-3',
                      )}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={active ? 'step' : undefined}
                      className={clsx(
                        'block w-full rounded-2xl border p-5 text-left transition-[border-color,background-color,opacity] duration-300',
                        active ? 'border-line-3 bg-ink-2' : 'border-line hover:border-line-2',
                        i > step && 'opacity-45',
                        s.basis === 'illustrative' && 'border-dashed',
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-paper">{STAGES[s.stage].label}</span>
                        <BasisBadge basis={s.basis} />
                      </span>
                      <span className="mt-3 block text-[0.9375rem] leading-relaxed text-paper-2">{s.text}</span>
                    </button>
                    {(active || past || reduced) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2 px-1">
                        {s.rows.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {s.rows.map((id) => (
                              <EntryPill key={id} id={id} />
                            ))}
                          </div>
                        )}
                        <SourceRef line={s.line} />
                      </motion.div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
