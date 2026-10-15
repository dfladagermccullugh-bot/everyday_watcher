import type { Entry, SourceFile } from './data';

export const PERIODS = [
  { id: 'early', label: 'Before 1975', from: -Infinity, to: 1974 },
  { id: '1975', label: '1975–1989', from: 1975, to: 1989 },
  { id: '1990', label: '1990s', from: 1990, to: 1999 },
  { id: '2000', label: '2000s', from: 2000, to: 2009 },
  { id: '2010', label: '2010s', from: 2010, to: 2019 },
  { id: '2020', label: '2020s', from: 2020, to: Infinity },
] as const;
export const periodOf = (e: Entry) => PERIODS.find((p) => e.yearNum >= p.from && e.yearNum <= p.to)!.id;

/** One-line statement of what the year means and where it comes from. */
export function yearBasisText(_e: Entry): string {
  return 'Year from the spreadsheet: the earliest practical introduction or documented deployment of the modern form, not necessarily its invention or widespread adoption.';
}

export const MILESTONE_KIND: Record<string, string> = {
  first: 'First documented in the report',
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
  if (file === 'sheet') return `/sources/spreadsheet/#R${line}`;
  return `/sources/${file === 'report' ? 'report' : 'dataset'}/#L${line}`;
}
export function sourceName(file: SourceFile) {
  return file === 'report' ? 'Report' : file === 'data' ? 'Dataset notes' : 'Spreadsheet';
}
export function sourceUnit(file: SourceFile) {
  return file === 'sheet' ? 'row' : 'line';
}
