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
  const placed = entries.filter((e) => e.pos.start != null).length;
  return (
    <Shell wide className="pb-28 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="The 50-Year Timeline" title="When the systems arrived, as far as the record shows.">
        <p>
          {placed} systems carry a date in the supplied research, alongside the laws and oversight that framed them. Press play to move through history,
          select a period, or highlight a category.
        </p>
      </PageIntro>
      <Suspense fallback={<div className="mt-10 h-[600px] animate-pulse rounded-3xl bg-ink-2" />}>
        <TimelineExplorer />
      </Suspense>
    </Shell>
  );
}
