import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FollowTheData } from '@/components/follow/FollowTheData';
import { PageIntro, Shell } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Follow the Data',
  description: 'How information moves from collection to linking, inference, and use: nine journeys traced through the research.',
};

export default function FollowPage() {
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+3.5rem)]">
      <PageIntro eyebrow="Follow the Data" title="From a single observation to a decision.">
        <p>
          Collecting a raw observation is only the first step. Linking it to an identifier, deriving something new from it, and acting on the result
          are separate steps — and often separate organizations. Each journey below marks which steps the report states and which are illustrative.
        </p>
      </PageIntro>
      <Suspense fallback={<div className="mt-12 h-96 animate-pulse rounded-3xl bg-ink-2" />}>
        <FollowTheData />
      </Suspense>
    </Shell>
  );
}
