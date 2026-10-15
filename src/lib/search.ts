import Fuse from 'fuse.js';
import { entries, CATEGORIES, SIGNALS, quote, type Entry } from './data';

// Plain-language aliases so common names find the right rows.
const ALIASES: Record<string, string> = {
  'anpr-alpr': 'license plate reader lpr flock number plate camera',
  'fixed-public-cctv': 'security camera surveillance camera closed circuit',
  'video-doorbell-cameras': 'ring doorbell',
  'smart-speakers': 'alexa echo',
  'voice-assistants': 'alexa siri',
  'imsi-catchers': 'stingray',
  'cell-site-simulators': 'stingray',
  'http-cookies': 'cookie',
  'mobile-advertising-ids': 'idfa aaid ad id',
  'automatic-content-recognition-acr': 'smart tv vizio',
  'electronic-health-records': 'ehr medical record',
  'vehicle-event-data-recorders': 'black box edr',
  'smartwatches': 'apple watch',
  'direct-to-consumer-dna-testing': 'ancestry 23andme genetic test',
  'prism-provider-collection': 'nsa snowden',
  'section-702-provider-collection': 'nsa fisa',
  'drone-surveillance': 'uav uas',
  'facial-recognition': 'face recognition frt',
  'electronic-toll-transponders': 'ez pass toll tag',
};

export type SearchDoc = Entry & { aliases: string; categoryLabel: string; signalLabel: string; paragraph: string };

const docs: SearchDoc[] = entries.map((e) => ({
  ...e,
  aliases: ALIASES[e.id] ?? '',
  categoryLabel: CATEGORIES[e.category].label,
  signalLabel: SIGNALS[e.signal].label,
  paragraph: quote('report', e.line)?.text ?? '',
}));

let fuse: Fuse<SearchDoc> | null = null;
export function search(q: string): Map<string, number> {
  fuse ??= new Fuse(docs, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.34,
    minMatchCharLength: 2,
    keys: [
      { name: 'name', weight: 4 },
      { name: 'aliases', weight: 3 },
      { name: 'purpose', weight: 1.5 },
      { name: 'categoryLabel', weight: 1 },
      { name: 'signalLabel', weight: 0.6 },
      { name: 'paragraph', weight: 0.5 },
    ],
  });
  const out = new Map<string, number>();
  for (const r of fuse.search(q.trim())) out.set(r.item.id, r.score ?? 0);
  return out;
}
