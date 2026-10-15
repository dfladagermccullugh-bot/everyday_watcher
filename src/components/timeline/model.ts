import { entries, timelineContext, CATEGORY_ORDER, type Entry, type CategoryId } from '@/lib/data';

export const YEAR_MIN = 1964;
export const YEAR_MAX = 2027;
export const PRE_END = 1975;

export const placed = entries.filter((e) => e.pos.start != null);
export const unplaced = entries.filter((e) => e.pos.start == null);
export const lanes: CategoryId[] = CATEGORY_ORDER.filter((c) => placed.some((e) => e.category === c));

/** Year at which a mark appears during playback. Pre-1975 rows appear first. */
export const revealYear = (e: Entry) => (e.pos.kind === 'pre' ? YEAR_MIN : e.pos.start!);

export type TimelineEvent =
  | { type: 'entry'; year: number; entry: Entry }
  | { type: 'context'; year: number; label: string; kind: string; rows: string[]; line: number };

export const events: TimelineEvent[] = [
  ...placed.map((e) => ({ type: 'entry' as const, year: revealYear(e), entry: e })),
  ...timelineContext.context.map((c) => ({ type: 'context' as const, ...c })),
].sort((a, b) => a.year - b.year);

export const eventYears = [...new Set(events.map((e) => e.year))].sort((a, b) => a - b);

export function markKindLabel(e: Entry) {
  switch (e.pos.kind) {
    case 'pre':
      return 'Pre-1975 in the CSV';
    case 'exact':
      return e.pos.label ? `${e.pos.start}, ${e.pos.label}` : `${e.pos.start}`;
    case 'approx':
      return `Approximately ${e.pos.start}`;
    case 'range':
      return `Approximate span ${e.pos.start}–${e.pos.end}`;
    case 'staged':
      return e.year ?? '';
    case 'milestone':
      return `${e.pos.start}: report milestone (${e.pos.milestoneLabel})`;
    default:
      return '';
  }
}
