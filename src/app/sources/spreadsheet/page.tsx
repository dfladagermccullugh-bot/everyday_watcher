import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell } from '@/components/ui';
import { entries, sheetRow, CATEGORIES } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Spreadsheet',
  description: 'The project spreadsheet, the source of truth for every system’s name, purpose, and year, with linkable row numbers.',
};

export default function SpreadsheetPage() {
  return (
    <Shell wide className="pb-28 pt-[calc(var(--nav-h)+3rem)]">
      <nav aria-label="Breadcrumb" className="text-sm text-paper-3">
        <Link href="/sources/" className="hover:text-paper">
          Sources
        </Link>{' '}
        <span className="mx-2">/</span> Spreadsheet
      </nav>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-paper-2">
        The three spreadsheet columns, reproduced verbatim. Row numbers match the workbook (row 1 is the header). The last column links to each
        system’s entry on this site.{' '}
        <a href="/data/surveillance_media.xlsx" download className="text-paper underline decoration-line-3 underline-offset-4">
          Download .xlsx
        </a>
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-[var(--nav-h)] z-10 bg-ink-2">
            <tr className="border-b border-line text-[0.6875rem] uppercase tracking-[0.12em] text-paper-3">
              <th className="w-14 px-3 py-3 text-right font-normal">Row</th>
              <th className="px-3 py-3 font-normal">The medium</th>
              <th className="px-3 py-3 font-normal">Its purpose</th>
              <th className="w-20 px-3 py-3 font-normal">Year</th>
              <th className="px-3 py-3 font-normal">On this site</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} id={`R${sheetRow(e)}`} className="scroll-mt-40 border-b border-line align-top last:border-0 target:bg-sig-visual/10">
                <td className="px-3 py-2.5 text-right font-mono text-xs text-paper-3 tabular">
                  <a href={`#R${sheetRow(e)}`} className="hover:text-paper">
                    {sheetRow(e)}
                  </a>
                </td>
                <td className="px-3 py-2.5 text-paper">{e.name}</td>
                <td className="px-3 py-2.5 text-paper-2">{e.purpose}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-paper-2 tabular">{e.year}</td>
                <td className="px-3 py-2.5 text-xs">
                  <Link href={`/atlas/${e.id}/`} className="text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-paper">
                    {CATEGORIES[e.category].short}
                  </Link>
                  {!e.line && <span className="ml-2 text-paper-3">· spreadsheet only</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
