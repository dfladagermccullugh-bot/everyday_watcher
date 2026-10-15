'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import { entries, linkKeys, relations, getEntry, keyById, siblingsOf, SIGNALS, CATEGORIES } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { useMediaQuery, useMounted } from '@/lib/hooks';
import { search } from '@/lib/search';
import { BasisBadge, SignalDot, SourceRef } from '../ui';
import { EDGE_KINDS, isKey, mostConnected, nodeLabel, type EdgeKind } from './graph';

const GraphCanvas = dynamic(() => import('./GraphCanvas'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-paper-3">Loading network…</div>,
});

export function Connections() {
  const { get, set } = useQueryState();
  const node = get('node');
  const valid = node && (getEntry(node) || keyById.get(node)) ? node : null;
  const mounted = useMounted();
  const wide = useMediaQuery('(min-width: 900px)');
  const [kinds, setKinds] = useState<Record<EdgeKind, boolean>>({ documented: true, illustrative: true, key: true, paragraph: true });
  const [trail, setTrail] = useState<string[]>([]);

  useEffect(() => {
    if (!valid) return;
    setTrail((t) => (t[t.length - 1] === valid ? t : [...t.filter((x) => x !== valid), valid].slice(-6)));
  }, [valid]);

  const select = (id: string | null) => set({ node: id });

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-ink-2/40 min-[900px]:grid min-[900px]:h-[calc(100dvh-var(--nav-h)-3rem)] min-[900px]:min-h-[620px] min-[900px]:grid-cols-[1fr_400px]">
      {mounted && wide && (
        <div className="relative min-h-0 border-r border-line bg-[radial-gradient(ellipse_at_center,#16161a_0%,#0b0b0c_70%)]">
          <GraphCanvas selected={valid} kinds={kinds} onSelect={select} />
          <fieldset className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            <legend className="sr-only">Show connection types</legend>
            {(Object.keys(EDGE_KINDS) as EdgeKind[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kinds[k]}
                title={EDGE_KINDS[k].hint}
                onClick={() => setKinds((s) => ({ ...s, [k]: !s[k] }))}
                className={clsx(
                  'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs backdrop-blur transition-colors',
                  kinds[k] ? 'border-line-3 bg-ink/80 text-paper' : 'border-line bg-ink/50 text-paper-3 line-through',
                )}
              >
                <span className="h-0.5 w-4 rounded" style={{ background: EDGE_KINDS[k].color, opacity: k === 'key' || k === 'paragraph' ? 1 : 1 }} />
                {EDGE_KINDS[k].label}
              </button>
            ))}
          </fieldset>
        </div>
      )}
      <Explorer selected={valid} onSelect={select} trail={trail} />
    </div>
  );
}

function Explorer({ selected, onSelect, trail }: { selected: string | null; onSelect: (id: string | null) => void; trail: string[] }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const s = search(q);
    const keys = linkKeys.filter((k) => k.label.toLowerCase().includes(q.toLowerCase())).map((k) => k.id);
    return [...keys, ...[...s.keys()]].slice(0, 8);
  }, [q]);

  return (
    <aside className="flex min-h-0 flex-col" aria-label="Connection explorer">
      <div className="border-b border-line p-4">
        <label className="relative block">
          <span className="sr-only">Find a system or linking key</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a system or key…"
            className="h-11 w-full rounded-full border border-line-2 bg-ink px-4 text-sm text-paper placeholder:text-paper-3 focus:border-paper-3 focus:outline-none"
          />
        </label>
        {results.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {results.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(id);
                    setQ('');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-paper-2 hover:bg-ink-3 hover:text-paper"
                >
                  {isKey(id) ? <KeyGlyph /> : <SignalDot signal={getEntry(id)!.signal} />}
                  {nodeLabel(id)}
                </button>
              </li>
            ))}
          </ul>
        )}
        {trail.length > 1 && (
          <nav aria-label="Path" className="mt-3 flex flex-wrap items-center gap-1 text-xs text-paper-3">
            {trail.map((id, i) => (
              <span key={id} className="inline-flex items-center gap-1">
                {i > 0 && <span aria-hidden="true">›</span>}
                <button type="button" onClick={() => onSelect(id)} className={clsx('max-w-[9rem] truncate rounded px-1 hover:text-paper', id === selected && 'text-paper')}>
                  {nodeLabel(id)}
                </button>
              </span>
            ))}
          </nav>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selected ?? 'home'} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            {!selected ? <Start onSelect={onSelect} /> : isKey(selected) ? <KeyView id={selected} onSelect={onSelect} /> : <NodeView id={selected} onSelect={onSelect} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function KeyGlyph() {
  return <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 rotate-45 border border-paper" />;
}

function Row({ id, onSelect, sub }: { id: string; onSelect: (id: string) => void; sub?: React.ReactNode }) {
  const e = getEntry(id);
  return (
    <button type="button" onClick={() => onSelect(id)} className="group flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left hover:bg-ink-3">
      <span className="mt-1.5">{e ? <SignalDot signal={e.signal} /> : <KeyGlyph />}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-paper">{nodeLabel(id)}</span>
        {sub && <span className="mt-0.5 block text-xs leading-relaxed text-paper-3">{sub}</span>}
      </span>
      <span aria-hidden="true" className="mt-1 text-paper-3 opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </button>
  );
}

function Start({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="eyebrow">Start anywhere</p>
      <p className="mt-3 text-sm leading-relaxed text-paper-2">
        Select a node or pick a starting point. Solid connections are stated in the report; blue ones are illustrative examples it does not state.
      </p>
      <h3 className="eyebrow mt-7">Linking keys</h3>
      <p className="mt-2 text-xs leading-relaxed text-paper-3">Identifiers that let records from different systems be joined.</p>
      <div className="mt-2">
        {linkKeys.map((k) => (
          <Row key={k.id} id={k.id} onSelect={onSelect} sub={`${k.members.length} systems`} />
        ))}
      </div>
      <h3 className="eyebrow mt-7">Most connected systems</h3>
      <div className="mt-2">
        {mostConnected().map(([id, n]) => (
          <Row key={id} id={id} onSelect={onSelect} sub={`${n} documented relationships`} />
        ))}
      </div>
    </div>
  );
}

function KeyView({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const k = keyById.get(id)!;
  return (
    <div>
      <p className="eyebrow flex items-center gap-2">
        <KeyGlyph /> Linking key
      </p>
      <h2 className="mt-3 font-serif text-[2.2rem] leading-none">{k.label}</h2>
      <p className="mt-4 text-sm leading-relaxed text-paper-2">{k.text}</p>
      <SourceRef line={k.line} className="mt-2" />
      <h3 className="eyebrow mt-7">Systems that use it · {k.members.length}</h3>
      <div className="mt-2">
        {k.members.map((m) => (
          <Row key={m} id={m} onSelect={onSelect} sub={CATEGORIES[getEntry(m)!.category].short} />
        ))}
      </div>
    </div>
  );
}

function NodeView({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const e = getEntry(id)!;
  const { set } = useQueryState();
  const rels = relations.filter((r) => r.source === id || r.target === id);
  const groups = (['documented', 'illustrative'] as const).map((b) => [b, rels.filter((r) => r.basis === b)] as const);
  const sibs = siblingsOf(e);
  return (
    <div>
      <p className="eyebrow flex items-center gap-2">
        <SignalDot signal={e.signal} /> {SIGNALS[e.signal].label} · {CATEGORIES[e.category].short}
      </p>
      <h2 className="mt-3 font-serif text-[2.2rem] leading-[1.02]">{e.name}</h2>
      <p className="mt-3 text-sm leading-relaxed text-paper-2">{e.purpose}</p>
      {!e.line && <p className="mt-2 text-xs leading-relaxed text-paper-3">Added in the spreadsheet; not described in the report. Its connections are illustrative.</p>}
      <button type="button" onClick={() => set({ entry: e.id })} className="mt-4 inline-flex min-h-9 items-center rounded-full bg-paper px-4 text-sm font-medium text-ink">
        Open full entry
      </button>

      {groups.map(([basis, list]) =>
        list.length ? (
          <section key={basis} className="mt-7">
            <h3 className="eyebrow flex items-center gap-2">
              {basis === 'documented' ? 'Stated in the report' : 'Illustrative, not stated'} · {list.length}
            </h3>
            <ul className="mt-2 space-y-1">
              {list.map((r, i) => {
                const other = r.source === id ? r.target : r.source;
                return (
                  <li key={i} className={clsx('rounded-xl', basis === 'illustrative' && 'border border-dashed border-ill/30')}>
                    <Row id={other} onSelect={onSelect} sub={<>{r.source === id ? '→ ' : '← '}{r.note}</>} />
                    <div className="flex items-center gap-2 px-3 pb-2 pl-8">
                      <BasisBadge basis={r.basis} />
                      {r.line ? <SourceRef line={r.line} /> : <span className="font-mono text-[0.6875rem] text-paper-3">Not stated in the report</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null,
      )}

      {e.keys.length > 0 && (
        <section className="mt-7">
          <h3 className="eyebrow">Linking keys</h3>
          <div className="mt-2">
            {e.keys.map((k) => (
              <Row key={k} id={k} onSelect={onSelect} sub={`Shared with ${keyById.get(k)!.members.length - 1} other systems`} />
            ))}
          </div>
        </section>
      )}
      {sibs.length > 0 && (
        <section className="mt-7">
          <h3 className="eyebrow">Same report paragraph</h3>
          <div className="mt-2">
            {sibs.map((s) => (
              <Row key={s.id} id={s.id} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}
      {!rels.length && !e.keys.length && !sibs.length && (
        <p className="mt-7 rounded-xl border border-line p-4 text-sm leading-relaxed text-paper-2">
          The report does not state a relationship between this system and another. That is a gap in the research, not evidence that none exists.
        </p>
      )}
    </div>
  );
}

export const totalNodes = entries.length + linkKeys.length;
