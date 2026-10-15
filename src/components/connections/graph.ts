import Graph from 'graphology';
import layoutJson from '@/data/generated/layout.json';
import { entries, linkKeys, relations, SIGNALS, byId } from '@/lib/data';

export type EdgeKind = 'documented' | 'illustrative' | 'key' | 'paragraph';
export const EDGE_KINDS: Record<EdgeKind, { label: string; color: string; hint: string }> = {
  documented: { label: 'Documented', color: 'rgba(242,238,230,0.62)', hint: 'The cited report line states this relationship' },
  illustrative: { label: 'Illustrative', color: 'rgba(130,169,245,0.75)', hint: 'A plausible example the report does not state' },
  key: { label: 'Linking key', color: 'rgba(242,238,230,0.13)', hint: 'Shares an identifier named in the report’s linkage table' },
  paragraph: { label: 'Same paragraph', color: 'rgba(242,238,230,0.09)', hint: 'Described together in one report paragraph' },
};

const layout = layoutJson as unknown as Record<string, [number, number]>;

export function buildGraph() {
  const g = new Graph({ type: 'undirected', multi: false });
  const relDegree = new Map<string, number>();
  relations.forEach((r) => {
    relDegree.set(r.source, (relDegree.get(r.source) ?? 0) + 1);
    relDegree.set(r.target, (relDegree.get(r.target) ?? 0) + 1);
  });
  for (const e of entries) {
    const [x, y] = layout[e.id];
    g.addNode(e.id, { x, y, size: 3.2 + Math.min(relDegree.get(e.id) ?? 0, 6) * 0.7, color: SIGNALS[e.signal].color, label: e.name, kind: 'entry' });
  }
  for (const k of linkKeys) {
    const [x, y] = layout[k.id];
    g.addNode(k.id, { x, y, size: 9, color: '#f2eee6', label: k.label, kind: 'key', forceLabel: true });
  }
  const add = (a: string, b: string, kind: EdgeKind, extra: Record<string, unknown> = {}) => {
    if (a === b || g.hasEdge(a, b)) return;
    g.addEdge(a, b, { kind, color: EDGE_KINDS[kind].color, size: kind === 'documented' || kind === 'illustrative' ? 1.4 : 0.6, ...extra });
  };
  relations.forEach((r) => add(r.source, r.target, r.basis, { note: r.note, line: r.line }));
  linkKeys.forEach((k) => k.members.forEach((m) => add(k.id, m, 'key')));
  const byLine = new Map<number, string[]>();
  entries.forEach((e) => byLine.set(e.line, [...(byLine.get(e.line) ?? []), e.id]));
  byLine.forEach((ids) => ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => add(a, b, 'paragraph'))));
  return g;
}

export const isKey = (id: string) => id.startsWith('k-');
export const nodeLabel = (id: string) => (isKey(id) ? linkKeys.find((k) => k.id === id)?.label : byId.get(id)?.name) ?? id;

/** Systems with the most stated relationships, as starting points. */
export function mostConnected(n = 8) {
  const deg = new Map<string, number>();
  relations
    .filter((r) => r.basis === 'documented')
    .forEach((r) => {
      deg.set(r.source, (deg.get(r.source) ?? 0) + 1);
      deg.set(r.target, (deg.get(r.target) ?? 0) + 1);
    });
  return [...deg.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}
