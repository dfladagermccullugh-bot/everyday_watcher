import type { Entry, SourceFile } from './data';

export function yearLabel(e: Entry): string {
  if (e.year) return e.year;
  return 'Not in supplied files';
}

/** One-line statement of where an entry's year comes from. */
export function yearBasisText(e: Entry): string {
  if (e.yearBasis === 'csv') {
    if (e.year === 'unknown') return 'The source CSV records this year as unknown.';
    return 'Year as recorded in the source CSV: the earliest practical introduction or documented deployment of the modern form, not necessarily its invention.';
  }
  if (e.yearBasis === 'described') return e.yearNote ?? 'Year value described in the supplied research.';
  if (e.pos.kind === 'milestone')
    return 'This row’s CSV year is not in the supplied files. It is placed on the timeline at a dated milestone the report states, which may be an adoption point rather than a first implementation.';
  return 'This row’s CSV year is not in the supplied files, and the report gives no date for it. It is not placed on the timeline.';
}

export function purposeBasisText(e: Entry): string {
  return e.purposeBasis === 'csv'
    ? 'Purpose as recorded in the source CSV.'
    : 'The CSV purpose for this row is not in the supplied files. This purpose paraphrases the report paragraph the row maps to.';
}

export const MILESTONE_KIND: Record<string, string> = {
  first: 'First documented',
  pilot: 'Pilot',
  national: 'National launch',
  adoption: 'Adoption milestone',
  legal: 'Law or authorization',
  standard: 'Standard',
  example: 'Documented example',
  documented: 'Documented practice',
  oversight: 'Oversight',
  context: 'Context',
};

export function sourceHref(file: SourceFile, line: number) {
  return `/sources/${file === 'report' ? 'report' : 'dataset'}/#L${line}`;
}
export function sourceName(file: SourceFile) {
  return file === 'report' ? 'Report' : 'Dataset notes';
}
