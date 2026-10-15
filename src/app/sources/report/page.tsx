import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell } from '@/components/ui';
import { SourceDocument } from '@/components/sources/SourceDocument';

export const metadata: Metadata = {
  title: 'Research report',
  description: 'The full supplied research report, with numbered lines that every claim on this site links to.',
};

export default function ReportPage() {
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+3rem)]">
      <nav aria-label="Breadcrumb" className="text-sm text-paper-3">
        <Link href="/sources/" className="hover:text-paper">Sources</Link> <span className="mx-2">/</span> Research report
      </nav>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-paper-2">
        The supplied report, reproduced unchanged and numbered by line. Citation tokens appear as bracketed source labels inferred from the sentence they
        support; the file itself contains tokens, not URLs.
      </p>
      <div className="mt-10 max-w-4xl">
        <SourceDocument file="research/deep-research-report.md" />
      </div>
    </Shell>
  );
}
