import entriesJson from '@/data/generated/entries.json';
import relationsJson from '@/data/generated/relations.json';
import keysJson from '@/data/generated/keys.json';
import timelineJson from '@/data/generated/timeline.json';
import dayJson from '@/data/generated/day.json';
import flowsJson from '@/data/generated/flows.json';
import tripJson from '@/data/generated/trip.json';
import quotesJson from '@/data/generated/quotes.json';
import metaJson from '@/data/generated/meta.json';
import reportJson from '@/data/generated/report.json';
import citationsJson from '@/data/generated/citations.json';

export type SignalId = 'visual' | 'audio' | 'radio' | 'network' | 'transaction' | 'body' | 'sensor' | 'derived';
export type CategoryId =
  | 'gov' | 'police' | 'city' | 'remote' | 'body' | 'telecom' | 'location' | 'mobility' | 'web'
  | 'cloud' | 'media' | 'retail' | 'finance' | 'brokers' | 'health' | 'work' | 'home' | 'inference';
export type Actor = 'government' | 'commercial' | 'mixed';
export type Scope = 'c' | 'k' | 'l';
export type SourceFile = 'report' | 'data';

export type Milestone = { year: number; kind: string; label: string; file: SourceFile; line: number };
export type Position = {
  kind: 'exact' | 'approx' | 'range' | 'pre' | 'staged' | 'milestone' | 'unknown' | 'none';
  start?: number;
  end?: number;
  approx?: boolean;
  label?: string;
  stages?: { year: number; label: string }[];
  milestoneKind?: string;
  milestoneLabel?: string;
  unknownInCsv?: boolean;
};
export type Entry = {
  id: string;
  n: number;
  name: string;
  purpose: string;
  purposeBasis: 'csv' | 'report';
  year: string | null;
  yearBasis: 'csv' | 'described' | 'none';
  yearNote: string | null;
  yearSource: { file: SourceFile; line: number } | null;
  pos: Position;
  sortYear: number;
  category: CategoryId;
  signal: SignalId;
  actor: Actor;
  line: number;
  section: string;
  milestones: Milestone[];
  noteLines: number[];
  keys: string[];
  moments: { id: string; scope: Scope }[];
  flows: string[];
};
export type Relation = { source: string; target: string; type: string; basis: 'documented' | 'illustrative'; line: number; note: string };
export type LinkKey = { id: string; label: string; line: number; members: string[]; text: string };
export type Quote = { title: string | null; text: string; cites: string[] };
export type Moment = { id: string; time: string; title: string; line: string; body: string; rows: { id: string; scope: Scope }[]; feature?: string };
export type FlowStep = { stage: 'collect' | 'link' | 'derive' | 'use'; text: string; rows: string[]; line: number; basis: 'documented' | 'illustrative' };
export type Flow = { id: string; title: string; lede: string; steps: FlowStep[] };

export const entries = entriesJson as Entry[];
export const relations = relationsJson as Relation[];
export const linkKeys = keysJson as LinkKey[];
export const timelineContext = timelineJson as {
  context: { year: number; label: string; kind: string; rows: string[]; line: number }[];
  eras: { from: number; to: number; label: string; line: number }[];
};
export const day = dayJson as Moment[];
export const flows = flowsJson as Flow[];
export const trip = tripJson as { row: number; id: string; where: string; visible: boolean }[];
export const quotes = quotesJson as Record<SourceFile, Record<string, Quote>>;
export const meta = metaJson;
export const report = reportJson as { linkage: string[][]; executive: string[]; scope: string; limits: string; inference: string; pattern: string };

export const citations = citationsJson as { id: string; label: string; lines: number[] }[];
export const citationById = new Map(citations.map((c) => [c.id, c]));

export const byId = new Map(entries.map((e) => [e.id, e]));
export const keyById = new Map(linkKeys.map((k) => [k.id, k]));
export const getEntry = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
export const quote = (file: SourceFile, line: number): Quote | undefined => quotes[file]?.[String(line)];

export const SIGNALS: Record<SignalId, { label: string; color: string; hint: string }> = {
  visual: { label: 'Visual', color: '#E8A951', hint: 'Faces, plates, bodies, rooms, imagery' },
  audio: { label: 'Audio', color: '#E58FA8', hint: 'Voices, calls, ambient sound' },
  radio: { label: 'Radio', color: '#57C4B5', hint: 'Cell, Wi‑Fi, Bluetooth, RFID, GPS' },
  network: { label: 'Network', color: '#82A9F5', hint: 'Requests, logs, messages, identifiers' },
  transaction: { label: 'Transaction', color: '#CDD06A', hint: 'Purchases, fares, tolls, bookings' },
  body: { label: 'Body', color: '#EE8B6B', hint: 'Biometrics, DNA, physiological and health data' },
  sensor: { label: 'Sensor', color: '#9CCB98', hint: 'Meters, motion, occupancy, vehicle telemetry' },
  derived: { label: 'Derived', color: '#B8A2F3', hint: 'Scores, segments, graphs, predictions' },
};
export const SIGNAL_ORDER = Object.keys(SIGNALS) as SignalId[];

export const CATEGORIES: Record<CategoryId, { label: string; short: string }> = {
  gov: { label: 'Government & intelligence', short: 'Government' },
  police: { label: 'Policing & security', short: 'Policing' },
  city: { label: 'Public space & infrastructure', short: 'Public space' },
  remote: { label: 'Aerial & remote sensing', short: 'Aerial' },
  body: { label: 'Biometrics & identity', short: 'Biometrics' },
  telecom: { label: 'Phones & telecommunications', short: 'Telecom' },
  location: { label: 'Location & proximity radio', short: 'Location' },
  mobility: { label: 'Vehicles & travel', short: 'Vehicles' },
  web: { label: 'Internet, apps & advertising', short: 'Internet' },
  cloud: { label: 'Accounts, email & cloud', short: 'Cloud' },
  media: { label: 'Media & entertainment', short: 'Media' },
  retail: { label: 'Retail & commerce', short: 'Retail' },
  finance: { label: 'Finance & credit', short: 'Finance' },
  brokers: { label: 'Data brokers & records', short: 'Brokers' },
  health: { label: 'Health & medicine', short: 'Health' },
  work: { label: 'Work & school', short: 'Work & school' },
  home: { label: 'Home & connected devices', short: 'Home' },
  inference: { label: 'Inference & prediction', short: 'Inference' },
};
export const CATEGORY_ORDER = Object.keys(CATEGORIES) as CategoryId[];

export const ACTORS: Record<Actor, string> = { government: 'Government', commercial: 'Commercial / private', mixed: 'Government & private' };

export const SCOPES: Record<Scope, { label: string; long: string }> = {
  c: { label: 'Common', long: 'Part of ordinary infrastructure for many people' },
  k: { label: 'Conditional', long: 'Depends on a device, service, employer, or choice' },
  l: { label: 'Location-specific', long: 'Depends on where you are and what is deployed there' },
};

export const STAGES = {
  collect: { label: 'Collect', long: 'Raw data is captured' },
  link: { label: 'Link', long: 'Records are tied to an identifier' },
  derive: { label: 'Derive', long: 'New information is inferred' },
  use: { label: 'Use', long: 'The result informs a decision or product' },
} as const;

/** Relations touching an entry, split by direction. */
export function relationsFor(id: string) {
  return relations.filter((r) => r.source === id || r.target === id);
}
export function siblingsOf(e: Entry) {
  return entries.filter((x) => x.line === e.line && x.id !== e.id);
}
