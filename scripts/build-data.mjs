// Builds the normalized dataset.
//
// Inputs (never modified):
//   research/surveillance_media.xlsx       SOURCE OF TRUTH: medium, purpose, year (one row per system)
//   research/deep-research-report.md       the research report: context, citations, relationships
//   research/dataset-reconstruction.md     row-to-report-paragraph map and date notes
// Outputs:
//   src/data/generated/*.json              app data
//   data/surveillance_media.csv            plain three-column export of the spreadsheet

import fs from 'node:fs';
import path from 'node:path';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import readXlsxFile from 'read-excel-file/node';
import { ROWS, NEW_ROWS, DESCRIBED_YEARS, MILESTONES, CONTEXT_EVENTS, ERAS, DATE_NOTES, KEYS } from './enrichment.mjs';
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

// ---------- source of truth: the spreadsheet ----------
const sheet = (await readXlsxFile(path.join(root, 'research/surveillance_media.xlsx')))[0].data;
const [header, ...sheetRows] = sheet.filter((r) => r.some((c) => c != null && String(c).trim()));
if (header.join('|') !== 'The medium|Its purpose|The year of implementation') fail(`unexpected header ${header.join(', ')}`);
const source = sheetRows.map(([medium, purpose, year], i) => {
  if (!medium || !purpose || year == null) fail(`sheet row ${i + 2} has an empty cell`);
  const y = Number(year);
  if (!Number.isInteger(y)) fail(`sheet row ${i + 2}: year "${year}" is not a whole year`);
  return { n: i + 1, name: String(medium).trim(), purpose: String(purpose).trim(), year: y };
});
console.log(`• spreadsheet: ${source.length} rows`);

// Report paragraph for each row, from the dataset notes' row-to-line map (292 rows).
const inventory = new Map();
for (const l of dataLines) {
  const m = l.match(/^- \*\*(\d{3})\. (.+?)\*\* → line (\d+)/);
  if (m) inventory.set(m[2].trim(), { ref: +m[1], line: +m[3] });
}
if (inventory.size !== 292) fail(`expected 292 inventory rows, found ${inventory.size}`);

const enrichByRef = new Map(ROWS.map(([ref, cat, sig, actor]) => [ref, { cat, sig, actor }]));
const enrichByName = new Map(NEW_ROWS.map(([name, cat, sig, actor]) => [name, { cat, sig, actor }]));
const described = new Map(DESCRIBED_YEARS.map(([ref, value, file, line, note]) => [ref, { value, file, line, note }]));

const slug = (s) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/\(([^)]+)\)/g, ' $1').replace(/[‑–—/]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Does a report year description ("pre-1975", "approx. 1980s", "1990 pilot"…) match a spreadsheet year? */
const agrees = (value, year) => {
  let m;
  if (/^pre-1975$/.test(value)) return year < 1975;
  if ((m = value.match(/^approx\. (\d{4})s$/))) return year >= +m[1] && year <= +m[1] + 9;
  if ((m = value.match(/^approx\. (\d{4})/))) return Math.abs(year - +m[1]) <= 2;
  if ((m = value.match(/^(\d{4})/))) return year === +m[1];
  fail(`cannot compare report year "${value}"`);
};

const milestonesFor = new Map();
for (const [ref, year, kind, label, file, line] of MILESTONES) {
  if (!lineAt(file, line).trim()) fail(`milestone line ${file}:${line} empty`);
  if (!milestonesFor.has(ref)) milestonesFor.set(ref, []);
  milestonesFor.get(ref).push({ year, kind, label, file, line });
}
const notesFor = new Map();
for (const [line, refs] of DATE_NOTES) for (const ref of refs) notesFor.set(ref, [...(notesFor.get(ref) ?? []), line]);

const CAT_ORDER = ['gov', 'police', 'city', 'remote', 'body', 'telecom', 'location', 'mobility', 'web', 'cloud', 'media', 'retail', 'finance', 'brokers', 'health', 'work', 'home', 'inference'];
const groups = [...new Set(source.map((r) => r.purpose))];

const entries = source.map(({ n, name, purpose, year }) => {
  const inv = inventory.get(name);
  const e = inv ? enrichByRef.get(inv.ref) : enrichByName.get(name);
  if (!e) fail(`no enrichment for "${name}" (add it to NEW_ROWS in scripts/enrichment.mjs)`);
  if (!CAT_ORDER.includes(e.cat)) fail(`"${name}": unknown category ${e.cat}`);
  if (inv) paragraph(inv.line); // validates the line
  const d = inv ? described.get(inv.ref) : null;
  // How the report itself dates the row, and whether that matches the spreadsheet.
  const reportDating = d ? { value: d.value, file: d.file, line: d.line, note: d.note, agrees: agrees(d.value, year) } : null;
  return {
    id: slug(name),
    n,
    ref: inv?.ref ?? null,
    name,
    purpose,
    group: groups.indexOf(purpose),
    year: String(year),
    yearNum: year,
    reportDating,
    category: e.cat,
    signal: { v: 'visual', a: 'audio', r: 'radio', n: 'network', t: 'transaction', p: 'body', e: 'sensor', d: 'derived' }[e.sig],
    actor: { g: 'government', c: 'commercial', m: 'mixed' }[e.actor],
    line: inv?.line ?? null,
    section: inv ? sectionFor(inv.line) : null,
    milestones: inv ? (milestonesFor.get(inv.ref) ?? []).sort((a, b) => a.year - b.year) : [],
    noteLines: inv ? (notesFor.get(inv.ref) ?? []) : [],
    keys: [],
    moments: [],
    flows: [],
  };
});
for (const name of enrichByName.keys()) if (!source.some((r) => r.name === name)) fail(`NEW_ROWS entry "${name}" is not in the spreadsheet`);
for (const name of inventory.keys()) if (!source.some((r) => r.name === name)) console.warn(`! report row "${name}" is not in the spreadsheet`);

const ids = new Set();
for (const e of entries) {
  if (ids.has(e.id)) fail(`duplicate id ${e.id}`);
  ids.add(e.id);
}
// Narrative files refer to rows by report inventory number or by exact spreadsheet name.
const byRef = new Map(entries.filter((e) => e.ref).map((e) => [e.ref, e]));
const byName = new Map(entries.map((e) => [e.name, e]));
const need = (r, where) => (typeof r === 'number' ? byRef.get(r) : byName.get(r)) ?? fail(`${where}: unknown row ${r}`);
const byN = { get: (r) => need(r, 'lookup') };

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
  if (basis === 'documented' && !line) fail(`documented relation ${a}→${b} needs a report line`);
  if (line && !lineAt('report', line).trim()) fail(`relation line ${line} empty`);
  return { source: byN.get(a).id, target: byN.get(b).id, type, basis, line, note };
});
// Rows described together in one report paragraph.
const byLine = new Map();
for (const e of entries.filter((x) => x.line)) {
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
  source: 'research/surveillance_media.xlsx',
  counts: {
    rows: entries.length,
    inReport: entries.filter((e) => e.line).length,
    sheetOnly: entries.filter((e) => !e.line).length,
    reportDatesDiffer: entries.filter((e) => e.reportDating && !e.reportDating.agrees).length,
    before1975: entries.filter((e) => e.yearNum < 1975).length,
    groups: groups.length,
    relationsDocumented: relations.filter((r) => r.basis === 'documented').length,
    relationsIllustrative: relations.filter((r) => r.basis === 'illustrative').length,
  },
  yearRange: [Math.min(...entries.map((e) => e.yearNum)), Math.max(...entries.map((e) => e.yearNum))],
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
  if (e.line) quote('report', e.line);
  e.noteLines.forEach((l) => quote('report', l));
  e.milestones.forEach((m) => quote(m.file, m.line));
  if (e.reportDating) quote(e.reportDating.file, e.reportDating.line);
}
relations.forEach((r) => r.line && quote('report', r.line));
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

// Plain three-column export of the spreadsheet, for download.
const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csv = ['The medium,Its purpose,The year of implementation', ...source.map((r) => [r.name, r.purpose, String(r.year)].map(esc).join(','))].join('\n') + '\n';
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/surveillance_media.csv'), csv);
fs.mkdirSync(path.join(root, 'public/data'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/data/surveillance_media.csv'), csv);
fs.copyFileSync(path.join(root, 'research/surveillance_media.xlsx'), path.join(root, 'public/data/surveillance_media.xlsx'));

console.log('✓ data built', meta.counts);
