import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Connections } from '@/components/connections/Connections';
import { PageIntro, Shell } from '@/components/ui';
import { meta, linkKeys } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Connections',
  description: 'A network of surveillance systems and the identifiers that link their records, distinguishing documented relationships from illustrative ones.',
};

export default function ConnectionsPage() {
  return (
    <Shell wide className="pb-24 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="Connected Systems" title="Surveillance is an ecosystem, not a device.">
        <p>
          {meta.counts.relationsDocumented} relationships stated in the report, {meta.counts.relationsIllustrative} clearly marked illustrative examples, and{' '}
          {linkKeys.length} linking keys — the identifiers that let one system’s records be joined to another’s.
        </p>
      </PageIntro>
      <Suspense fallback={<div className="mt-8 h-[70vh] animate-pulse rounded-3xl bg-ink-2" />}>
        <Connections />
      </Suspense>
    </Shell>
  );
}
