import { entries, timelineContext, CATEGORY_ORDER, type Entry, type CategoryId } from '@/lib/data';

const years = entries.map((e) => e.yearNum);
/** Earliest spreadsheet year, rounded down to a 5-year boundary. */
export const YEAR_MIN = Math.floor((Math.min(...years) - 2) / 5) * 5;
export const YEAR_MAX = Math.max(2027, Math.max(...years) + 2);
/** Start of the report's main window; earlier years are drawn compressed. */
export const PRE_END = 1975;
/** Share of the chart width given to years before PRE_END. */
export const EARLY_SHARE = 0.2;

export const lanes: CategoryId[] = CATEGORY_ORDER.filter((c) => entries.some((e) => e.category === c));

export type TimelineEvent =
  | { type: 'entry'; year: number; entry: Entry }
  | { type: 'context'; year: number; label: string; kind: string; rows: string[]; line: number };

export const events: TimelineEvent[] = [
  ...entries.map((e) => ({ type: 'entry' as const, year: e.yearNum, entry: e })),
  ...timelineContext.context.map((c) => ({ type: 'context' as const, ...c })),
].sort((a, b) => a.year - b.year);

export const eventYears = [...new Set(events.map((e) => e.year))].sort((a, b) => a - b);

/** Report milestones that fall in a different year from the spreadsheet year. */
export const otherMilestones = (e: Entry) => e.milestones.filter((m) => m.year !== e.yearNum);
