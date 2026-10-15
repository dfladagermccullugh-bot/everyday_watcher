import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageIntro, Shell } from '@/components/ui';
import { TimelineExplorer } from '@/components/timeline/Timeline';
import { entries } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'An interactive timeline of documented surveillance and data-collection systems, laws, and oversight from before 1975 to today.',
};

export default function TimelinePage() {
  return (
    <Shell wide className="pb-28 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="The Timeline" title="When the systems arrived, as far as the record shows.">
        <p>
          All {entries.length} systems, placed by the year the spreadsheet gives for each, alongside the laws and oversight the report records. Press
          play to move through history, select a period, or highlight a category. Zoom in to read every label.
        </p>
      </PageIntro>
      <Suspense fallback={<div className="mt-10 h-[600px] animate-pulse rounded-3xl bg-ink-2" />}>
        <TimelineExplorer />
      </Suspense>
    </Shell>
  );
}
