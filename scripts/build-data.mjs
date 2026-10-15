// Builds the normalized dataset from the supplied research files.
//
// Inputs (never modified):
//   research/deep-research-report.md       the research report
//   research/dataset-reconstruction.md     the 292-row inventory, sample rows, and date notes
//   data/surveillance_media.csv            OPTIONAL original three-column CSV. When present,
//                                          its purpose and year values replace reconstructed ones.
// Outputs:
//   src/data/generated/*.json               app data
//   data/surveillance_media.reconstructed.csv   three-column CSV assembled from the inputs

import fs from 'node:fs';
import path from 'node:path';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { ROWS, DESCRIBED_YEARS, MILESTONES, CONTEXT_EVENTS, ERAS, DATE_NOTES, KEYS } from './enrichment.mjs';
import { RELATIONS } from './relations.mjs';
import { DAY, FLOWS, TRIP } from './stories.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (msg) => {
  console.error(`\n✖ data build failed: ${msg}\n`);
  process.exit(1);
};

const reportLines = read('research/deep-research-report.md').split('\n');
const dataLines = read('research/dataset-reconstruction.md').split('\n');
const lineAt = (file, n) => (file === 'data' ? dataLines : reportLines)[n - 1] ?? '';

// ---------- citations ----------
// Tokens look like \ue200cite\ue202turn13search1\ue202turn13search5\ue201
const CITE_RE = /\ue200?cite((?:\ue202?turn\d+(?:search|view)\d+)+)\ue201?/g;
const citesIn = (s) => {
  const out = [];
  for (const m of s.matchAll(CITE_RE)) for (const id of m[1].replace(/\ue202/g, '').split('turn').filter(Boolean)) out.push(id);
  return [...new Set(out)];
};
const clean = (s) =>
  s
    .replace(CITE_RE, '')
    .replace(/\ue200?filecite\ue202?\w+\ue201?/g, '')
    .replace(/[\ue200-\ue2ff]/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

// Source labels inferred from the sentence each citation token supports in the report.
// The supplied files contain citation tokens, not URLs.
const SOURCE_LABELS = {
  '13search1': 'NIST · FERET program history',
  '13search5': 'NIST · FERET database',
  '13search6': 'U.S. DOJ · police body-worn cameras',
  '13search26': 'NIST · automated fingerprint matching',
  '0search5': 'FBI · IAFIS',
  '0search1': 'FBI · Next Generation Identification',
  '9search5': 'FBI · CODIS',
  '9search11': 'FBI · NDIS',
  '9search25': 'U.S. health-IT adoption after HITECH',
  '9search30': 'U.S. health-IT adoption after HITECH',
  '9search3': 'FTC · health apps guidance',
  '9search6': 'FTC · health apps guidance',
  '10search2': 'NHGRI · direct-to-consumer genomic testing',
  '11search10': 'FTC · people-search sites',
  '14search0': 'FCC · wireless E911 location',
  '14search12': 'FCC · E911 Phase II',
  '14search1': 'FCC · CALEA',
  '14search7': 'CALEA (1994)',
  '15search0': 'FTC · online behavioral advertising',
  '15search1': 'W3C · browser fingerprinting',
  '15search2': 'IETF · RFC 2109',
  '15search3': 'FTC · data brokers report',
  '15search7': 'FTC · data brokers report',
  '15search10': 'IETF · HTTP state management',
  '15search13': 'Browser fingerprinting research',
  '15search31': 'FTC · location data enforcement',
  '16search0': 'Apple · Apple Watch heart-rate sensor',
  '16search1': 'Amazon · Alexa and Echo',
  '16search2': 'FTC · Vizio smart-TV case',
  '16search3': 'DOE · Recovery Act smart grid',
  '16search10': 'DOE · smart-meter deployment',
  '16search14': 'Apple · Apple Watch release',
  '16search21': 'FTC · Vizio smart-TV case',
  '17search1': 'NHTSA · event data recorders',
  '18search12': 'AWS · CloudTrail launch',
  '18search18': 'AWS · CloudTrail',
  '19search0': 'PCLOB · Section 215 program',
  '19search1': 'PCLOB · Section 702',
  '19search2': 'PCLOB · Section 702',
  '20search0': 'FTC · retail and mobile device tracking',
  '20search3': 'Bluetooth SIG · location services',
  '20search6': 'NIST · RFID',
  '20search13': 'NIST · RFID',
  '20search14': 'Bluetooth SIG · location services',
  '20search16': 'Bluetooth SIG · Bluetooth Low Energy',
  '21search0': 'USGS · Landsat',
  '21search1': 'FAA · civil unmanned aircraft',
  '21search3': 'FTC · Facebook facial recognition',
  '21search7': 'USGS · Landsat',
  '22view0': 'PCLOB · Section 215 report',
  '22view1': 'PCLOB · Section 702 report',
  '8search6': 'FTC · surveillance pricing',
};

// ---------- report structure ----------
const sections = [];
reportLines.forEach((l, i) => {
  const m = l.match(/^\*\*([^*]+)\*\*\s*$/);
  if (m) sections.push({ line: i + 1, title: m[1] });
});
const sectionFor = (line) => [...sections].reverse().find((s) => s.line <= line)?.title ?? 'Scope and method';

const paragraph = (line) => {
  const raw = lineAt('report', line);
  if (!raw.trim()) fail(`report line ${line} is empty`);
  const t = raw.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
  return {
    title: t ? clean(t[1]).replace(/\.$/, '') : null,
    text: clean(t ? t[2] : raw.replace(/^- /, '')),
    cites: citesIn(raw),
  };
};

// ---------- inventory ----------
const inventory = [];
for (const l of dataLines) {
  const m = l.match(/^- \*\*(\d{3})\. (.+?)\*\* → line (\d+)/);
  if (m) inventory.push({ n: +m[1], name: m[2].trim(), line: +m[3] });
}
if (inventory.length !== 292) fail(`expected 292 inventory rows, found ${inventory.length}`);

const sample = new Map();
for (const l of dataLines.slice(42, 65)) {
  const c = l.split('|').map((s) => s.trim());
  if (c.length === 5 && c[1] && !c[1].startsWith('---') && c[1] !== 'The medium') sample.set(c[1], { purpose: c[2], year: c[3] });
}
if (sample.size !== 20) fail(`expected 20 sample rows, found ${sample.size}`);

// Optional original CSV.
const parseCsv = (txt) => {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) {
      if (ch === '"' && txt[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && txt[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
};
const originalPath = path.join(root, 'data/surveillance_media.csv');
const original = new Map();
if (fs.existsSync(originalPath)) {
  const [, ...rows] = parseCsv(fs.readFileSync(originalPath, 'utf8'));
  for (const [medium, purpose, year] of rows) original.set(medium.trim().toLowerCase(), { purpose: purpose.trim(), year: year.trim() });
  console.log(`• original CSV found: ${original.size} rows`);
}

const enrich = new Map(ROWS.map(([n, cat, sig, actor, purpose]) => [n, { cat, sig, actor, purpose }]));
if (enrich.size !== 292) fail(`enrichment covers ${enrich.size} rows`);
const described = new Map(DESCRIBED_YEARS.map(([n, value, file, line, note]) => [n, { value, file, line, note }]));

const slug = (s) =>
  s.toLowerCase().replace(/\(([^)]+)\)/g, ' $1').replace(/[‑–—/]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- year parsing (display string is never altered) ----------
const parseYear = (value) => {
  if (!value) return { kind: 'none' };
  const v = value.trim();
  if (/^unknown$/i.test(v)) return { kind: 'unknown' };
  if (/^pre-1975$/i.test(v)) return { kind: 'pre', start: 1965, end: 1974 };
  if (v.includes(';')) {
    const stages = v.split(';').map((s) => {
      const y = +s.match(/\d{4}/)[0];
      return { year: y, label: s.replace(/approx\.\s*/, '').replace(String(y), '').replace(/from/, '').trim() || 'first' };
    });
    return { kind: 'staged', start: stages[0].year, end: stages.at(-1).year, stages, approx: /approx/.test(v) };
  }
  let m;
  if ((m = v.match(/^approx\. (\d{4})s$/))) return { kind: 'range', start: +m[1], end: +m[1] + 9, approx: true };
  if ((m = v.match(/^approx\. (\d{4})[–-](\d{4})$/))) return { kind: 'range', start: +m[1], end: +m[2], approx: true };
  if ((m = v.match(/^approx\. (\d{4})$/))) return { kind: 'approx', start: +m[1], end: +m[1], approx: true };
  if ((m = v.match(/^(\d{4})$/))) return { kind: 'exact', start: +m[1], end: +m[1] };
  if ((m = v.match(/^(\d{4}) (.+)$/))) return { kind: 'exact', start: +m[1], end: +m[1], label: m[2] };
  fail(`unparsed year "${v}"`);
};

const milestonesFor = new Map();
for (const [n, year, kind, label, file, line] of MILESTONES) {
  if (!lineAt(file, line).trim()) fail(`milestone line ${file}:${line} empty`);
  if (!milestonesFor.has(n)) milestonesFor.set(n, []);
  milestonesFor.get(n).push({ year, kind, label, file, line });
}
const notesFor = new Map();
for (const [line, rows] of DATE_NOTES) {
  const text = clean(lineAt('report', line));
  const title = text.match(/^(.+?\.)\s/)?.[1] ?? '';
  for (const n of rows) {
    if (!notesFor.has(n)) notesFor.set(n, []);
    notesFor.get(n).push({ line, title, text: text.slice(title.length).trim() });
  }
}

const CAT_ORDER = ['gov', 'police', 'city', 'remote', 'body', 'telecom', 'location', 'mobility', 'web', 'cloud', 'media', 'retail', 'finance', 'brokers', 'health', 'work', 'home', 'inference'];

const entries = inventory.map(({ n, name, line }) => {
  const e = enrich.get(n);
  if (!CAT_ORDER.includes(e.cat)) fail(`row ${n}: unknown category ${e.cat}`);
  const orig = original.get(name.toLowerCase());
  const s = sample.get(name);
  const d = described.get(n);
  let purpose, purposeBasis, year = null, yearBasis = 'none', yearNote = null, yearSource = null;
  if (orig) {
    purpose = orig.purpose; purposeBasis = 'csv'; year = orig.year; yearBasis = 'csv';
  } else if (s) {
    purpose = s.purpose; purposeBasis = 'csv'; year = s.year; yearBasis = 'csv';
    yearSource = { file: 'data', line: 43 };
  } else {
    if (!e.purpose) fail(`row ${n} (${name}) has no purpose`);
    purpose = e.purpose; purposeBasis = 'report';
    if (d) { year = d.value; yearBasis = 'described'; yearNote = d.note; yearSource = { file: d.file, line: d.line }; }
  }
  if (s && e.purpose) fail(`row ${n}: sample row should not carry a reconstructed purpose`);
  const ms = (milestonesFor.get(n) ?? []).sort((a, b) => a.year - b.year);
  let pos = parseYear(year);
  if ((pos.kind === 'none' || pos.kind === 'unknown') && ms.length) {
    const firm = ms.find((m) => ['first', 'pilot', 'national', 'example', 'documented', 'legal'].includes(m.kind));
    const pick = firm ?? ms[0];
    pos = { kind: 'milestone', start: pick.year, end: pick.year, milestoneKind: pick.kind, milestoneLabel: pick.label, unknownInCsv: pos.kind === 'unknown' };
  }
  paragraph(line); // validates the line
  return {
    id: slug(name),
    n,
    name,
    purpose,
    purposeBasis,
    year,
    yearBasis,
    yearNote,
    yearSource,
    pos,
    sortYear: pos.start ?? (pos.kind === 'unknown' ? 9998 : 9999),
    category: e.cat,
    signal: { v: 'visual', a: 'audio', r: 'radio', n: 'network', t: 'transaction', p: 'body', e: 'sensor', d: 'derived' }[e.sig],
    actor: { g: 'government', c: 'commercial', m: 'mixed' }[e.actor],
    line,
    section: sectionFor(line),
    milestones: ms,
    noteLines: (notesFor.get(n) ?? []).map((x) => x.line),
    keys: [],
    moments: [],
    flows: [],
  };
});

const ids = new Set();
for (const e of entries) {
  if (ids.has(e.id)) fail(`duplicate id ${e.id}`);
  ids.add(e.id);
}
const byN = new Map(entries.map((e) => [e.n, e]));
const need = (n, where) => byN.get(n) ?? fail(`${where}: unknown row ${n}`);

for (const k of KEYS) for (const n of k.rows) need(n, k.id).keys.push(k.id);
for (const m of DAY) for (const [n, scope] of m.rows) need(n, `day ${m.id}`).moments.push({ id: m.id, scope });
for (const f of FLOWS) for (const s of f.steps) for (const n of s.rows) {
  const e = need(n, `flow ${f.id}`);
  if (!e.flows.includes(f.id)) e.flows.push(f.id);
}

// ---------- relations ----------
const relations = RELATIONS.map(([a, b, type, basis, line, note]) => {
  need(a, 'relation'); need(b, 'relation');
  if (!['documented', 'illustrative'].includes(basis)) fail(`relation basis ${basis}`);
  if (!lineAt('report', line).trim()) fail(`relation line ${line} empty`);
  return { source: byN.get(a).id, target: byN.get(b).id, type, basis, line, note };
});
// Rows described together in one report paragraph.
const byLine = new Map();
for (const e of entries) {
  if (!byLine.has(e.line)) byLine.set(e.line, []);
  byLine.get(e.line).push(e.id);
}

// ---------- graph layout (deterministic) ----------
const graph = new Graph({ multi: false, type: 'undirected' });
entries.forEach((e) => {
  const ci = CAT_ORDER.indexOf(e.category);
  const a = (ci / CAT_ORDER.length) * Math.PI * 2 + (e.n % 7) * 0.04;
  const r = 100 + (e.n % 11) * 3;
  graph.addNode(e.id, { x: Math.cos(a) * r, y: Math.sin(a) * r, kind: 'entry' });
});
KEYS.forEach((k, i) => {
  const xs = k.rows.map((n) => graph.getNodeAttribute(byN.get(n).id, 'x'));
  const ys = k.rows.map((n) => graph.getNodeAttribute(byN.get(n).id, 'y'));
  graph.addNode(k.id, { x: xs.reduce((a, b) => a + b) / xs.length * 0.6 + i, y: ys.reduce((a, b) => a + b) / ys.length * 0.6, kind: 'key' });
});
const addEdge = (a, b, w) => {
  if (a === b) return;
  if (graph.hasEdge(a, b)) graph.updateEdgeAttribute(a, b, 'weight', (x) => x + w);
  else graph.addEdge(a, b, { weight: w });
};
for (const r of relations) addEdge(r.source, r.target, 2);
for (const k of KEYS) for (const n of k.rows) addEdge(k.id, byN.get(n).id, 0.6);
for (const group of byLine.values()) for (let i = 1; i < group.length; i++) addEdge(group[i - 1], group[i], 1.5);
// Weak category cohesion keeps isolated rows near their neighbours.
const catAnchor = new Map();
for (const e of entries) {
  if (!catAnchor.has(e.category)) catAnchor.set(e.category, e.id);
  else if (graph.degree(e.id) === 0) addEdge(catAnchor.get(e.category), e.id, 0.4);
}
forceAtlas2.assign(graph, {
  iterations: 900,
  settings: { ...forceAtlas2.inferSettings(graph), gravity: 1.2, scalingRatio: 12, barnesHutOptimize: false, edgeWeightInfluence: 1, linLogMode: false, adjustSizes: false, slowDown: 2 },
});
const layout = {};
graph.forEachNode((id, a) => (layout[id] = [Math.round(a.x * 10) / 10, Math.round(a.y * 10) / 10]));

// ---------- write ----------
const out = path.join(root, 'src/data/generated');
fs.mkdirSync(out, { recursive: true });
const write = (f, v) => fs.writeFileSync(path.join(out, f), JSON.stringify(v));

const usedCites = new Set();
for (const l of reportLines) citesIn(l).forEach((c) => usedCites.add(c));
const citations = [...usedCites].sort().map((id) => {
  const lines = [];
  reportLines.forEach((l, i) => citesIn(l).includes(id) && lines.push(i + 1));
  return { id, label: SOURCE_LABELS[id] ?? 'Unlabeled citation', lines };
});

const meta = {
  generatedFrom: original.size ? 'original-csv' : 'reconstruction',
  counts: {
    rows: entries.length,
    purposeCsv: entries.filter((e) => e.purposeBasis === 'csv').length,
    yearCsv: entries.filter((e) => e.yearBasis === 'csv').length,
    yearDescribed: entries.filter((e) => e.yearBasis === 'described').length,
    yearNone: entries.filter((e) => e.yearBasis === 'none').length,
    placed: entries.filter((e) => e.pos.start != null).length,
    placedFromMilestone: entries.filter((e) => e.pos.kind === 'milestone').length,
    relationsDocumented: relations.filter((r) => r.basis === 'documented').length,
    relationsIllustrative: relations.filter((r) => r.basis === 'illustrative').length,
  },
  datasetSummary: { exact: 31, approx: 220, pre1975: 28, unknown: 9, staged: 3, approxStaged: 1 },
};

write('entries.json', entries);

// Every report / dataset line the interface quotes, keyed by line number.
const quoted = { report: {}, data: {} };
const quote = (file, line) => {
  const raw = lineAt(file, line);
  const t = raw.match(/^- \*\*(.+?)\*\*\s*(.*)$/) ?? raw.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  quoted[file][line] = { title: t ? clean(t[1]).replace(/\.$/, '') : null, text: clean(t ? t[2] : raw.replace(/^[-|]\s*/, '')), cites: citesIn(raw) };
};
for (const e of entries) {
  quote('report', e.line);
  e.noteLines.forEach((l) => quote('report', l));
  e.milestones.forEach((m) => quote(m.file, m.line));
  if (e.yearSource) quote(e.yearSource.file, e.yearSource.line);
}
relations.forEach((r) => quote('report', r.line));
FLOWS.forEach((f) => f.steps.forEach((s) => quote('report', s.line)));
CONTEXT_EVENTS.forEach((c) => quote('report', c.line));
KEYS.forEach((k) => quote('report', k.line));
write('quotes.json', quoted);
write('relations.json', relations);
const keyText = (line) => {
  const raw = lineAt('report', line);
  if (raw.startsWith('|')) {
    const [layer, obs, key, becomes] = raw.split('|').slice(1, -1).map((c) => c.trim());
    return `${layer} signals (${obs}) are linked by ${key}, and can become ${becomes}.`;
  }
  const p = paragraph(line);
  return p.title ? `${p.title}. ${p.text}` : p.text;
};
write('keys.json', KEYS.map(({ id, label, line, rows }) => ({ id, label, line, members: rows.map((n) => byN.get(n).id), text: keyText(line) })));
write('layout.json', layout);
write('timeline.json', {
  context: CONTEXT_EVENTS.map((c) => ({ ...c, rows: c.rows.map((n) => byN.get(n).id) })),
  eras: ERAS,
});
write('day.json', DAY.map((m) => ({ ...m, rows: m.rows.map(([n, scope]) => ({ id: byN.get(n).id, scope })) })));
write('flows.json', FLOWS.map((f) => ({ ...f, steps: f.steps.map((s) => ({ ...s, rows: s.rows.map((n) => byN.get(n).id) })) })));
write('trip.json', TRIP.map((t) => ({ ...t, id: byN.get(t.row).id })));
write('citations.json', citations);
write('meta.json', meta);
write('report.json', {
  linkage: reportLines.slice(368, 377).filter((l) => l.startsWith('| ') && !l.startsWith('|---') && !l.startsWith('| Signal')).map((l) => l.split('|').slice(1, -1).map((c) => c.trim())),
  executive: [clean(reportLines[4]), clean(reportLines[8])],
  scope: clean(reportLines[14]),
  limits: clean(reportLines[20]),
  inference: clean(reportLines[378]),
  pattern: clean(reportLines[411]),
});

// Three-column CSV assembled from the supplied files (does not replace an original).
const esc = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const csv = ['The medium,Its purpose,The year of implementation', ...entries.map((e) => [e.name, e.purpose, e.year ?? 'not in supplied files'].map(esc).join(','))].join('\n');
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/surveillance_media.reconstructed.csv'), csv + '\n');
fs.mkdirSync(path.join(root, 'public/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/data/surveillance_media.reconstructed.csv'), csv + '\n');

console.log('✓ data built', meta.counts);
