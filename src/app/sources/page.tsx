import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, Shell, SourceRef } from '@/components/ui';
import { citations, entries, meta, relations, quote } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Sources & Method',
  description: 'How the dataset was compiled, what is missing from the supplied files, what the site does and does not measure, and every citation.',
};

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="bg-ink p-5">
      <p className="font-mono text-3xl text-paper tabular">{n}</p>
      <p className="mt-1.5 text-sm leading-snug text-paper-2">{label}</p>
    </div>
  );
}

function Q({ line, file = 'report' as const }: { line: number; file?: 'report' | 'data' }) {
  const q = quote(file, line);
  return (
    <figure className="border-l border-line-3 pl-5">
      <blockquote className="text-[0.9375rem] leading-relaxed text-paper-2">{q?.text}</blockquote>
      <figcaption className="mt-1.5">
        <SourceRef file={file} line={line} />
      </figcaption>
    </figure>
  );
}

export default function SourcesPage() {
  const c = meta.counts;
  const unknown = entries.filter((e) => e.year === 'unknown').length;
  const undated = entries.filter((e) => e.pos.start == null).length;
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="Sources & Method" title="What this is built from, and what it cannot tell you.">
        <p>
          Two supplied files are the sources of truth: a research report and a set of dataset notes describing a 292-row, three-column CSV. Both are
          reproduced in full with numbered lines, and every reference on this site links to a line.
        </p>
      </PageIntro>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/sources/report/" className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-sm font-medium text-ink">
          Read the report
        </Link>
        <Link href="/sources/dataset/" className="inline-flex min-h-11 items-center rounded-full border border-line-3 px-5 text-sm text-paper">
          Read the dataset notes
        </Link>
        <a href="/data/surveillance_media.reconstructed.csv" download className="inline-flex min-h-11 items-center rounded-full border border-line-3 px-5 text-sm text-paper">
          Download the assembled CSV
        </a>
      </div>

      <section id="status" className="mt-20 scroll-mt-28">
        <h2 className="font-serif text-[2.4rem] leading-tight">The state of the data</h2>
        <div className="mt-6 max-w-3xl space-y-4 text-[1.0625rem] leading-relaxed text-paper-2">
          <p>
            The CSV itself was not among the supplied files. The dataset notes name all 292 rows and map each to a report paragraph, but include the
            original purpose and year for only {c.purposeCsv} of them. The site does not invent the rest.
          </p>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Stat n={c.rows} label="Rows, each mapped to a report paragraph" />
          <Stat n={c.yearCsv} label="Rows with purpose and year from the supplied CSV sample" />
          <Stat n={c.yearDescribed} label="Other rows whose CSV year the report or notes describe" />
          <Stat n={c.placedFromMilestone} label="Rows placed on the timeline only by a dated report milestone" />
          <Stat n={unknown} label="Rows recorded as unknown in the CSV" />
          <Stat n={undated} label="Rows not on the timeline" />
          <Stat n={c.relationsDocumented} label="Relationships stated in the report" />
          <Stat n={c.relationsIllustrative} label="Illustrative relationships, marked as such" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Q file="data" line={13} />
          <Q file="data" line={17} />
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-paper-3">
          The counts in the second quotation describe the full CSV. They cannot be reproduced here because the CSV was not attached. To use it, place it at{' '}
          <code className="rounded bg-ink-3 px-1 font-mono">data/surveillance_media.csv</code> and rebuild: its purpose and year values replace the
          reconstructed ones automatically, matched by medium name.
        </p>
      </section>

      <section id="method" className="mt-20 scroll-mt-28">
        <h2 className="font-serif text-[2.4rem] leading-tight">How the research defines its terms</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="eyebrow">Scope</h3>
            <div className="mt-3">
              <Q line={15} />
            </div>
          </div>
          <div>
            <h3 className="eyebrow">What a year means</h3>
            <div className="mt-3">
              <Q line={17} />
            </div>
          </div>
          <div>
            <h3 className="eyebrow">Sources preferred</h3>
            <div className="mt-3">
              <Q line={19} />
            </div>
          </div>
          <div>
            <h3 className="eyebrow">Completeness</h3>
            <div className="mt-3">
              <Q line={21} />
            </div>
          </div>
        </div>
      </section>

      <section id="added" className="mt-20 scroll-mt-28">
        <h2 className="font-serif text-[2.4rem] leading-tight">What this site adds</h2>
        <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-paper-2">
          Internal fields support exploration. None are added to the CSV, and the editorial ones are labeled where they appear.
        </p>
        <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {[
            ['Stable ID, report line, report section', 'Derived mechanically from the dataset notes’ row-to-line map.'],
            ['Purpose for rows outside the sample', 'A paraphrase of the mapped report paragraph. Flagged on every entry.'],
            ['Signal type', 'Based on the report’s own signal-to-linkage table (visual, radio, network, transaction, physiological, environmental, derived), plus audio.'],
            ['Category and operator', 'Editorial groupings of each paragraph’s description. Categories refine the brief’s proposed list against the research.'],
            ['Dated milestones', 'Only dates the report or notes state, with their line. Kinds distinguish first deployment, pilot, law, standard, example, and adoption.'],
            ['Relationships and linking keys', `Each of the ${relations.length} relationships cites a report line and is marked documented or illustrative.`],
            ['Scope in “An ordinary day”', 'Common, conditional, or location-specific: an editorial reading, not measured prevalence.'],
            ['Citation labels', 'The report contains citation tokens, not URLs. Labels name the source the cited sentence describes.'],
          ].map(([t, d]) => (
            <div key={t} className="border-t border-line pt-4">
              <dt className="text-paper">{t}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-paper-2">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="limits" className="mt-20 scroll-mt-28">
        <h2 className="font-serif text-[2.4rem] leading-tight">What it does not measure</h2>
        <ul className="mt-6 max-w-3xl space-y-3 text-[1.0625rem] leading-relaxed text-paper-2">
          <li>— How much surveillance exists, or how it grew. More entries in a decade reflects what the research documents and dates.</li>
          <li>— How common any system is, or whether it is present where you live.</li>
          <li>— Whether any use is lawful or improper. Inclusion does not imply either.</li>
          <li>— When a technology was invented or became widespread. A date is the earliest documented deployment of the modern form.</li>
          <li>— Relationships the report does not state. Absence of a connection is a gap in the research, not evidence that none exists.</li>
        </ul>
        <div className="mt-8 max-w-3xl">
          <Q file="data" line={397} />
        </div>
      </section>

      <section id="citations" className="mt-20 scroll-mt-28">
        <h2 className="font-serif text-[2.4rem] leading-tight">Citations in the report</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-paper-3">
          {citations.length} distinct citation tokens. Labels are inferred from the sentence each supports; follow the line links to read them in context.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3">
                <th className="px-4 py-3 font-normal">Source</th>
                <th className="px-4 py-3 font-normal">Token</th>
                <th className="px-4 py-3 font-normal">Cited on report lines</th>
              </tr>
            </thead>
            <tbody>
              {[...citations].sort((a, b) => a.label.localeCompare(b.label)).map((ci) => (
                <tr key={ci.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 text-paper">{ci.label}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-paper-3">{ci.id}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex flex-wrap gap-x-3">
                      {ci.lines.map((l) => (
                        <Link key={l} href={`/sources/report/#L${l}`} className="font-mono text-xs text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-paper">
                          {l}
                        </Link>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="privacy" className="mt-20 scroll-mt-28 rounded-3xl border border-line p-8">
        <h2 className="font-serif text-[2rem] leading-tight">This site’s own data practices</h2>
        <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-paper-2">
          Static files only: no analytics, cookies, trackers, accounts, or third-party requests at runtime. Fonts are self-hosted. Exploration state lives in
          the address bar so that links can be shared, and nowhere else.
        </p>
      </section>
    </Shell>
  );
}
