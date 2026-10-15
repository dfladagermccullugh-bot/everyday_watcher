import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EntryDetail } from '@/components/EntryDetail';
import { Shell } from '@/components/ui';
import { entries, getEntry, CATEGORIES } from '@/lib/data';

export const dynamicParams = false;

export function generateStaticParams() {
  return entries.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = getEntry(id);
  if (!e) return {};
  const description = `${e.purpose} ${CATEGORIES[e.category].label}. Implementation year: ${e.year}.`;
  return { title: e.name, description, openGraph: { title: e.name, description } };
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = getEntry(id);
  if (!e) notFound();
  return (
    <Shell className="pb-28 pt-[calc(var(--nav-h)+2.5rem)]">
      <nav aria-label="Breadcrumb" className="text-sm text-paper-3">
        <Link href="/atlas/" className="hover:text-paper">
          Atlas
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/atlas/?cat=${e.category}`} className="hover:text-paper">
          {CATEGORIES[e.category].label}
        </Link>
      </nav>
      <div className="mt-8 max-w-3xl">
        <EntryDetail entry={e} headingLevel="h1" />
      </div>
    </Shell>
  );
}
