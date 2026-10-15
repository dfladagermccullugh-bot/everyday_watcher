import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell } from '@/components/ui';
import { SourceDocument } from '@/components/sources/SourceDocument';

export const metadata: Metadata = {
  title: 'Dataset notes',
  description: 'The supplied dataset reconstruction notes: the 292-row inventory, sample rows, and date policy.',
};

export default function DatasetPage() {
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+3rem)]">
      <nav aria-label="Breadcrumb" className="text-sm text-paper-3">
        <Link href="/sources/" className="hover:text-paper">Sources</Link> <span className="mx-2">/</span> Dataset notes
      </nav>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-paper-2">
        The supplied dataset notes, reproduced unchanged and numbered by line. Citation tokens appear as bracketed source labels inferred from the sentence they
        support; the file itself contains tokens, not URLs.
      </p>
      <div className="mt-10 max-w-4xl">
        <SourceDocument file="research/dataset-reconstruction.md" />
      </div>
    </Shell>
  );
}
