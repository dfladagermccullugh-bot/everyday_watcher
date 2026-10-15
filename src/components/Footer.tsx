import Link from 'next/link';
import { NAV } from '@/lib/nav';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div className="max-w-md">
          <p className="font-serif text-2xl leading-tight text-paper">The Invisible Infrastructure</p>
          <p className="mt-3 text-sm leading-relaxed text-paper-2">
            Every factual statement on this site traces to a numbered line of the supplied research. Inclusion of a
            technology does not mean every use of it is improper surveillance.
          </p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link className="text-paper-2 hover:text-paper" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">This site</p>
          <ul className="mt-3 space-y-2 text-sm text-paper-2">
            <li>No trackers, cookies, or analytics.</li>
            <li>No accounts. Static files only.</li>
            <li>
              <Link className="underline decoration-line-3 underline-offset-4 hover:text-paper" href="/sources/#method">
                Methodology and limits
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
