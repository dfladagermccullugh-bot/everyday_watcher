import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Atlas } from '@/components/atlas/Atlas';
import { PageIntro, Shell } from '@/components/ui';
import { entries, meta } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'Search and filter all 292 documented surveillance and data-collection systems by signal, category, operator, and date status.',
};

export default function AtlasPage() {
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="The Surveillance Atlas" title={<>Every documented system, in one place.</>}>
        <p>
          {entries.length} media and mechanisms from the research, from fixed cameras to derived risk scores. Select any system to see where it comes
          from in the report, what it connects to, and how certain its date is.
        </p>
        <p className="mt-3 text-sm text-paper-3">
          The supplied files contain the original purpose and year for {meta.counts.purposeCsv} rows. Other purposes paraphrase the report and are
          marked as such.
        </p>
      </PageIntro>
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-3xl bg-ink-2" />}>
        <Atlas />
      </Suspense>
    </Shell>
  );
}
