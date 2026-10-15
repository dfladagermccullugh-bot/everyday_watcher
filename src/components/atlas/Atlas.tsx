'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'motion/react';
import clsx from 'clsx';
import {
  entries, CATEGORIES, CATEGORY_ORDER, SIGNALS, SIGNAL_ORDER, ACTORS, type Entry, type CategoryId, type SignalId, type Actor,
} from '@/lib/data';
import { search } from '@/lib/search';
import { PERIODS, periodOf } from '@/lib/format';
import { useQueryState } from '@/lib/url-state';
import { useUI } from '@/lib/store';
import { Chip, SignalDot, YearBadge } from '../ui';

type Source = 'report' | 'sheet';
const SOURCES: Record<Source, { label: string; hint: string }> = {
  report: { label: 'Described in the report', hint: 'Linked to a paragraph of the research report' },
  sheet: { label: 'Spreadsheet only', hint: 'Added in the updated spreadsheet; not described in the report' },
};
const sourceOf = (e: Entry): Source => (e.line ? 'report' : 'sheet');

type Sort = 'category' | 'az' | 'year' | 'relevance';
const SORTS: Record<Sort, string> = { category: 'By category', year: 'Earliest first', az: 'A–Z', relevance: 'Best match' };

type Filters = { cat: string[]; sig: string[]; period: string[]; src: string[]; actor: string[] };

function applyFilters(list: Entry[], f: Filters, skip?: keyof Filters) {
  return list.filter(
    (e) =>
      (skip === 'cat' || !f.cat.length || f.cat.includes(e.category)) &&
      (skip === 'sig' || !f.sig.length || f.sig.includes(e.signal)) &&
      (skip === 'period' || !f.period.length || f.period.includes(periodOf(e))) &&
      (skip === 'src' || !f.src.length || f.src.includes(sourceOf(e))) &&
      (skip === 'actor' || !f.actor.length || f.actor.includes(e.actor)),
  );
}

export function Atlas() {
  const { get, list, set } = useQueryState();
  const urlQ = get('q') ?? '';
  const [q, setQ] = useState(urlQ);
  const deferredQ = useDeferredValue(q);
  const inputRef = useRef<HTMLInputElement>(null);
  const filters: Filters = { cat: list('cat'), sig: list('sig'), period: list('period'), src: list('src'), actor: list('actor') };
  const sortParam = (get('sort') as Sort) || null;
  const sort: Sort = sortParam ?? (deferredQ.trim() ? 'relevance' : 'category');

  // Keep the input in sync when Back/Forward changes the URL (but never trim while typing).
  const qRef = useRef(q);
  qRef.current = q;
  useEffect(() => {
    if (urlQ !== qRef.current.trim()) setQ(urlQ);
  }, [urlQ]);
  // Commit typing to the URL without flooding history.
  useEffect(() => {
    const t = setTimeout(() => set({ q: q.trim() || null }, 'replace'), 220);
    return () => clearTimeout(t);
  }, [q, set]);
  // "/" focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scores = useMemo(() => (deferredQ.trim().length >= 2 ? search(deferredQ) : null), [deferredQ]);
  const base = useMemo(() => (scores ? entries.filter((e) => scores.has(e.id)) : entries), [scores]);
  const results = useMemo(() => {
    const r = applyFilters(base, filters);
    if (sort === 'az') return [...r].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'year') return [...r].sort((a, b) => a.yearNum - b.yearNum || a.n - b.n);
    if (sort === 'relevance' && scores) return [...r].sort((a, b) => scores.get(a.id)! - scores.get(b.id)!);
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, filters.cat.join(), filters.sig.join(), filters.period.join(), filters.src.join(), filters.actor.join(), sort, scores]);

  const facetCounts = useMemo(() => {
    const count = <K extends string>(key: keyof Filters, fn: (e: Entry) => K) => {
      const m = new Map<K, number>();
      applyFilters(base, filters, key).forEach((e) => m.set(fn(e), (m.get(fn(e)) ?? 0) + 1));
      return m;
    };
    return {
      cat: count('cat', (e) => e.category),
      sig: count('sig', (e) => e.signal),
      period: count('period', periodOf),
      src: count('src', sourceOf),
      actor: count('actor', (e) => e.actor),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, filters.cat.join(), filters.sig.join(), filters.period.join(), filters.src.join(), filters.actor.join()]);

  const toggle = (key: keyof Filters, value: string) => {
    const cur = filters[key];
    set({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  };
  const activeCount = filters.cat.length + filters.sig.length + filters.period.length + filters.src.length + filters.actor.length;
  const clearAll = () => {
    setQ('');
    set({ q: null, cat: null, sig: null, period: null, src: null, actor: null, sort: null });
  };

  const facets = <Facets filters={filters} counts={facetCounts} toggle={toggle} />;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[15.5rem_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-[calc(var(--nav-h)+1.5rem)] max-h-[calc(100dvh-var(--nav-h)-3rem)] overflow-y-auto pb-8 pr-2 scrollbar-none">{facets}</div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-[var(--nav-h)] z-20 -mx-4 border-b border-line bg-ink/85 px-4 pb-3 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search the atlas</span>
              <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-paper-3" width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => set({ q: q.trim() || null }, 'push')}
                placeholder="Search — try “plate”, “heart”, “cookie”"
                className="h-12 w-full rounded-full border border-line-2 bg-ink-2 pl-11 pr-12 text-[0.9375rem] text-paper placeholder:text-paper-3 focus:border-paper-3 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-line-2 px-1.5 font-mono text-[0.6875rem] text-paper-3 sm:block">/</kbd>
            </label>
            <Dialog.Root>
              <Dialog.Trigger className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-line-2 px-4 text-sm text-paper lg:hidden">
                Filters
                {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-paper px-1 font-mono text-[0.6875rem] text-ink">{activeCount}</span>}
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-[61] max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-line-2 bg-ink-2 px-5 pb-8 pt-4" aria-describedby={undefined}>
                  <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-3" />
                  <div className="mb-4 flex items-center justify-between">
                    <Dialog.Title className="font-serif text-2xl">Filters</Dialog.Title>
                    <Dialog.Close className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink">Show {results.length}</Dialog.Close>
                  </div>
                  {facets}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-paper-2" aria-live="polite">
              <span className="font-mono text-paper tabular">{results.length}</span> of {entries.length} systems
              {deferredQ.trim() && (
                <>
                  {' '}
                  matching <span className="text-paper">“{deferredQ.trim()}”</span>
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              {(activeCount > 0 || q) && (
                <button type="button" onClick={clearAll} className="text-sm text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper">
                  Clear all
                </button>
              )}
              <label className="flex items-center gap-2 text-sm text-paper-2">
                <span className="sr-only sm:not-sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => set({ sort: e.target.value === 'category' ? null : e.target.value })}
                  className="h-9 rounded-full border border-line-2 bg-ink-2 px-3 text-sm text-paper focus:outline-none"
                >
                  {(Object.keys(SORTS) as Sort[])
                    .filter((s) => s !== 'relevance' || scores)
                    .map((s) => (
                      <option key={s} value={s}>
                        {SORTS[s]}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filters.cat.map((c) => (
                <ActivePill key={c} label={CATEGORIES[c as CategoryId]?.short ?? c} onClear={() => toggle('cat', c)} />
              ))}
              {filters.sig.map((s) => (
                <ActivePill key={s} label={`${SIGNALS[s as SignalId]?.label ?? s} signal`} onClear={() => toggle('sig', s)} />
              ))}
              {filters.period.map((d) => (
                <ActivePill key={d} label={PERIODS.find((p) => p.id === d)?.label ?? d} onClear={() => toggle('period', d)} />
              ))}
              {filters.src.map((d) => (
                <ActivePill key={d} label={SOURCES[d as Source]?.label ?? d} onClear={() => toggle('src', d)} />
              ))}
              {filters.actor.map((a) => (
                <ActivePill key={a} label={ACTORS[a as Actor] ?? a} onClear={() => toggle('actor', a)} />
              ))}
            </div>
          )}
        </div>

        <Results results={results} grouped={sort === 'category'} onClear={clearAll} query={deferredQ.trim()} />
      </div>
    </div>
  );
}

function ActivePill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-full bg-ink-4 py-1 pl-3 pr-2 text-xs text-paper hover:bg-line-2" aria-label={`Remove filter ${label}`}>
      {label}
      <span aria-hidden="true" className="text-paper-3">
        ×
      </span>
    </button>
  );
}

function Facets({
  filters, counts, toggle,
}: {
  filters: Filters;
  counts: { cat: Map<string, number>; sig: Map<string, number>; period: Map<string, number>; src: Map<string, number>; actor: Map<string, number> };
  toggle: (k: keyof Filters, v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow mb-3">Signal</legend>
        <div className="flex flex-wrap gap-1.5">
          {SIGNAL_ORDER.map((s) => (
            <Chip key={s} active={filters.sig.includes(s)} onClick={() => toggle('sig', s)} count={counts.sig.get(s) ?? 0} title={SIGNALS[s].hint}>
              <SignalDot signal={s} />
              {SIGNALS[s].label}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Category</legend>
        <ul className="space-y-0.5">
          {CATEGORY_ORDER.map((c) => {
            const active = filters.cat.includes(c);
            const n = counts.cat.get(c) ?? 0;
            return (
              <li key={c}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle('cat', c)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] transition-colors',
                    active ? 'bg-paper text-ink' : 'text-paper-2 hover:bg-ink-3 hover:text-paper',
                    n === 0 && !active && 'opacity-40',
                  )}
                >
                  {CATEGORIES[c].label}
                  <span className={clsx('font-mono text-[0.6875rem] tabular', active ? 'text-ink/60' : 'text-paper-3')}>{n}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Period</legend>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <Chip key={p.id} active={filters.period.includes(p.id)} onClick={() => toggle('period', p.id)} count={counts.period.get(p.id) ?? 0}>
              {p.label}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Source</legend>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SOURCES) as Source[]).map((d) => (
            <Chip key={d} active={filters.src.includes(d)} onClick={() => toggle('src', d)} count={counts.src.get(d) ?? 0} title={SOURCES[d].hint}>
              {SOURCES[d].label}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">Operated by</legend>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ACTORS) as Actor[]).map((a) => (
            <Chip key={a} active={filters.actor.includes(a)} onClick={() => toggle('actor', a)} count={counts.actor.get(a) ?? 0}>
              {ACTORS[a]}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-paper-3">Operator labels are an editorial reading of each report paragraph.</p>
      </fieldset>
    </div>
  );
}

function Results({ results, grouped, onClear, query }: { results: Entry[]; grouped: boolean; onClear: () => void; query: string }) {
  if (!results.length) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-3xl">Nothing matches{query ? ` “${query}”` : ' these filters'}.</p>
        <p className="mx-auto mt-3 max-w-md text-paper-2">Search tolerates misspellings, but some systems go by other names. Try a broader word such as “camera”, “location”, or “score”.</p>
        <button type="button" onClick={onClear} className="mt-6 rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink">
          Clear search and filters
        </button>
      </div>
    );
  }
  if (!grouped) return <Grid items={results} />;
  const groups = CATEGORY_ORDER.map((c) => [c, results.filter((e) => e.category === c)] as const).filter(([, l]) => l.length);
  return (
    <div className="space-y-12 pt-6">
      {groups.map(([c, list]) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="cv-auto">
          <h2 id={`cat-${c}`} className="flex items-baseline gap-3 border-b border-line pb-3 font-serif text-[1.75rem] leading-none">
            {CATEGORIES[c].label}
            <span className="font-mono text-xs text-paper-3 tabular">{list.length}</span>
          </h2>
          <Grid items={list} />
        </section>
      ))}
    </div>
  );
}

function Grid({ items }: { items: Entry[] }) {
  return (
    <ul className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((e, i) => (
        <Card key={e.id} e={e} i={i} />
      ))}
    </ul>
  );
}

function Card({ e, i }: { e: Entry; i: number }) {
  const { set } = useQueryState();
  const hovered = useUI((s) => s.hovered === e.id);
  const setHovered = useUI((s) => s.setHovered);
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 18) * 0.015 }}>
      <button
        type="button"
        onClick={() => set({ entry: e.id })}
        onMouseEnter={() => setHovered(e.id)}
        onMouseLeave={() => setHovered(null)}
        className={clsx(
          'group flex h-full w-full flex-col justify-between gap-4 rounded-2xl border bg-ink-2/60 p-4 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-ink-2',
          hovered ? 'border-line-3' : 'border-line',
        )}
      >
        <span>
          <span className="flex items-start justify-between gap-3">
            <span className="text-[0.9375rem] font-medium leading-snug text-paper">{e.name}</span>
            <span className="mt-1 font-mono text-[0.625rem] text-paper-3 tabular">{String(e.n).padStart(3, '0')}</span>
          </span>
          <span className="mt-1.5 line-clamp-2 block text-[0.8125rem] leading-relaxed text-paper-2">{e.purpose}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-paper-3">
            <SignalDot signal={e.signal} size={7} />
            {SIGNALS[e.signal].label}
          </span>
          <YearBadge entry={e} />
        </span>
      </button>
    </motion.li>
  );
}
