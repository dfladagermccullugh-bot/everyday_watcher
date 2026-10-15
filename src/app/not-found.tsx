import Link from 'next/link';
import { Shell } from '@/components/ui';

export default function NotFound() {
  return (
    <Shell className="flex min-h-[80vh] flex-col justify-center pt-[var(--nav-h)]">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-serif text-title">Nothing was recorded here.</h1>
      <p className="mt-4 max-w-md text-paper-2">The page you were looking for does not exist. The atlas lists everything that does.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/atlas/" className="rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink">Open the atlas</Link>
        <Link href="/" className="rounded-full border border-line-3 px-5 py-2.5 text-sm text-paper">Home</Link>
      </div>
    </Shell>
  );
}
