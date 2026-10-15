'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { report, SIGNALS, entries, type SignalId } from '@/lib/data';
import { SourceRef } from '../ui';

const LAYER: Record<string, SignalId> = {
  Visual: 'visual',
  Radio: 'radio',
  Network: 'network',
  Transaction: 'transaction',
  Physiological: 'body',
  Environmental: 'sensor',
  Derived: 'derived',
};

export function Linkage() {
  return (
    <section aria-labelledby="linkage-title" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">Part two · The connective layer</p>
          <h2 id="linkage-title" className="mt-4 font-serif text-title text-balance">
            A signal becomes a profile when it is linked.
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-paper-2 text-pretty">
            The report separates the raw observation from the key that joins it to other records. The last row is the one that matters most:
            data no sensor directly measured.
          </p>
          <blockquote className="mt-8 border-l border-line-3 pl-5 font-serif text-xl italic leading-snug text-paper text-pretty">
            “{report.inference.split('. ').slice(0, 1).join('. ')}.”
          </blockquote>
          <SourceRef line={379} className="mt-3 pl-5" />
        </div>

        <div className="lg:col-span-8">
          <div className="hidden grid-cols-[8rem_1fr_1fr_1fr] gap-4 border-b border-line pb-3 text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3 md:grid">
            <span>Layer</span>
            <span>Raw observation</span>
            <span>Linking key</span>
            <span>What it can become</span>
          </div>
          <ol>
            {report.linkage.map(([layer, raw, key, becomes], i) => {
              const sig = LAYER[layer];
              const count = entries.filter((e) => e.signal === sig).length;
              return (
                <motion.li
                  key={layer}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative border-b border-line"
                >
                  <Link
                    href={`/atlas/?sig=${sig}`}
                    className="grid gap-x-4 gap-y-1.5 py-4 transition-colors hover:bg-ink-2 md:grid-cols-[8rem_1fr_1fr_1fr] md:items-center md:px-0"
                  >
                    <span className="flex items-center gap-2 text-paper">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: SIGNALS[sig].color }} />
                      {layer}
                      <span className="font-mono text-[0.6875rem] text-paper-3 tabular md:hidden">{count} systems</span>
                    </span>
                    <span className="text-sm text-paper-2">
                      <span className="mr-2 text-paper-3 md:hidden">Observes</span>
                      {raw}
                    </span>
                    <span className="relative text-sm text-paper-2">
                      <span className="mr-2 text-paper-3 md:hidden">Linked by</span>
                      <span className="rounded-md border border-line-2 px-1.5 py-0.5 font-mono text-[0.75rem] text-paper">{key}</span>
                    </span>
                    <span className="flex items-center justify-between gap-3 text-sm text-paper">
                      <span>
                        <span className="mr-2 text-paper-3 md:hidden">Becomes</span>
                        {becomes}
                      </span>
                      <span className="hidden font-mono text-[0.6875rem] text-paper-3 opacity-0 transition-opacity group-hover:opacity-100 md:inline">{count} →</span>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ol>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-paper-3">
            <span>Audio is a collection dimension in the report but not a row of this table.</span>
            <SourceRef line={369} />
          </div>
        </div>
      </div>
    </section>
  );
}
