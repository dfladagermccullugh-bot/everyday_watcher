'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORIES, SIGNALS, entries, timelineContext, getEntry, type Entry, type CategoryId } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { useElementSize, useMediaQuery, useMounted } from '@/lib/hooks';
import { useUI } from '@/lib/store';
import { Chip, SourceRef, EntryPill } from '../ui';
import { lanes, YEAR_MIN, YEAR_MAX, PRE_END, EARLY_SHARE, events, eventYears, otherMilestones, type TimelineEvent } from './model';
import { TimelineList } from './TimelineList';
import { MILESTONE_KIND } from '@/lib/format';

const LABEL_W = 168;
const AXIS_H = 64;
const ROW_H = 24;
const LANE_PAD = 14;
const DECADES = [
  { id: 'all', label: 'All', from: YEAR_MIN, to: YEAR_MAX },
  { id: 'pre', label: 'Before 1975', from: YEAR_MIN, to: 1976 },
  { id: '1970', label: '1970s', from: 1969, to: 1981 },
  { id: '1980', label: '1980s', from: 1979, to: 1991 },
  { id: '1990', label: '1990s', from: 1989, to: 2001 },
  { id: '2000', label: '2000s', from: 1999, to: 2011 },
  { id: '2010', label: '2010s', from: 2009, to: 2021 },
  { id: '2020', label: '2020s', from: 2017, to: YEAR_MAX },
];

export function TimelineExplorer() {
  const mounted = useMounted();
  const desktop = useMediaQuery('(min-width: 900px)', true);
  const { list, set, get } = useQueryState();
  const cats = list('cat') as CategoryId[];
  const year = get('year') ? Number(get('year')) : null;
  const focus = get('focus');
  const toggleCat = (c: CategoryId) => set({ cat: cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c] });

  const player = usePlayer();

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none fade-x sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Highlight categories">
          {lanes.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => toggleCat(c)} count={entries.filter((e) => e.category === c).length}>
              {CATEGORIES[c].short}
            </Chip>
          ))}
          {cats.length > 0 && (
            <button type="button" className="shrink-0 px-2 text-sm text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper" onClick={() => set({ cat: null })}>
              Clear
            </button>
          )}
        </div>
        <PlayControls player={player} />
      </div>

      <AnimatePresence>{player.year != null && <PlayCaption year={player.year} />}</AnimatePresence>

      {mounted && desktop ? (
        <ChartDesktop cats={cats} year={year} focus={focus} playYear={player.year} setYear={(y) => set({ year: y == null ? null : String(y) }, 'replace')} />
      ) : (
        <TimelineList cats={cats} playYear={player.year} />
      )}

      <Legend />
    </div>
  );
}

/* ---------------------------------------------------------------- playback */

function usePlayer() {
  const [year, setYear] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useUI((s) => s.reducedMotion);
  const raf = useRef(0);
  const yearRef = useRef<number | null>(null);
  yearRef.current = year;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let hold = 0;
    let lastHeldYear = -1;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const cur = yearRef.current ?? YEAR_MIN - 1;
      if (hold > 0) {
        hold -= dt;
      } else {
        // Reduced motion: jump between event years instead of gliding.
        const nextEvent = eventYears.find((y) => y > cur + 0.0001);
        // Early history is compressed on the chart, so playback glides through it faster.
        let next = reduced ? (nextEvent ?? YEAR_MAX) : cur + dt * (cur < PRE_END ? 14 : 3.2);
        if (!reduced && cur >= PRE_END - 1 && nextEvent != null && next >= nextEvent && lastHeldYear !== nextEvent) {
          next = nextEvent;
          lastHeldYear = nextEvent;
          hold = 0.75;
        }
        if (reduced) hold = 1.6;
        if (next >= YEAR_MAX) {
          setYear(YEAR_MAX);
          setPlaying(false);
          return;
        }
        setYear(next);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, reduced]);

  const step = (dir: 1 | -1) => {
    setPlaying(false);
    const cur = yearRef.current ?? YEAR_MIN - 1;
    const y = dir === 1 ? eventYears.find((v) => v > Math.floor(cur) + 0.5) : [...eventYears].reverse().find((v) => v < Math.ceil(cur) - 0.5);
    if (y != null) setYear(y);
  };

  return {
    year,
    playing,
    play: () => {
      if (year == null || year >= YEAR_MAX) setYear(YEAR_MIN - 1);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    stop: () => {
      setPlaying(false);
      setYear(null);
    },
    step,
  };
}
type Player = ReturnType<typeof usePlayer>;

function PlayControls({ player }: { player: Player }) {
  const btn = 'grid h-10 w-10 place-items-center rounded-full border border-line-2 text-paper-2 transition-colors hover:border-line-3 hover:text-paper disabled:opacity-40';
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" className={btn} onClick={() => player.step(-1)} aria-label="Previous event" disabled={player.year == null}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M8 2L4 6l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={player.playing ? player.pause : player.play}
        className="inline-flex h-10 items-center gap-2.5 rounded-full bg-paper pl-4 pr-5 text-sm font-medium text-ink transition-transform active:scale-[0.98]"
        aria-pressed={player.playing}
      >
        {player.playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <rect x="2" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" />
            <rect x="7.4" y="1.5" width="2.6" height="9" rx=".6" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 1.8v8.4a.6.6 0 00.9.5l6.6-4.2a.6.6 0 000-1L3.9 1.3a.6.6 0 00-.9.5z" fill="currentColor" />
          </svg>
        )}
        {player.playing ? 'Pause' : player.year != null && player.year < YEAR_MAX ? 'Resume' : 'Play through history'}
      </button>
      <button type="button" className={btn} onClick={() => player.step(1)} aria-label="Next event">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {player.year != null && (
        <button type="button" onClick={player.stop} className="px-2 text-sm text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper">
          Reset
        </button>
      )}
    </div>
  );
}

function PlayCaption({ year }: { year: number }) {
  const y = Math.floor(year);
  const here = events.filter((e) => e.year === y);
  const shown = here;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
        <p className="w-36 shrink-0 font-mono text-5xl leading-none text-paper tabular">{y}</p>
        <div className="min-h-[3.5rem] flex-1">
          {shown.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {shown.map((ev, i) =>
                ev.type === 'entry' ? (
                  <li key={ev.entry.id}>
                    <EntryPill id={ev.entry.id} />
                  </li>
                ) : (
                  <li key={`c${i}`} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-dashed border-line-3 px-3 text-[0.8125rem] text-paper">
                    <span className="text-paper-3">◆</span>
                    {ev.label}
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="pt-2 text-sm text-paper-3">No dated events in the supplied research for this year.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- desktop chart */

type Item = { e: Entry; x0: number; start: number; end: number; row: number };
type Cluster = { ids: string[]; x: number; row: number; year: number };

/** Years before PRE_END share EARLY_SHARE of the width; the main window gets the rest. */
const baseScale = (w: number) => d3.scaleLinear().domain([YEAR_MIN, PRE_END, YEAR_MAX]).range([0, w * EARLY_SHARE, w]);

function ChartDesktop({ cats, year, focus, playYear, setYear }: { cats: CategoryId[]; year: number | null; focus: string | null; playYear: number | null; setYear: (y: number | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { width } = useElementSize(box);
  const innerW = Math.max(width - LABEL_W - 24, 200);
  const [t, setT] = useState(d3.zoomIdentity);
  const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [tip, setTip] = useState<{ e: Entry; x: number; y: number } | null>(null);
  const [ctxTip, setCtxTip] = useState<{ label: string; line: number; x: number; y: number } | null>(null);
  const { set } = useQueryState();
  const hovered = useUI((s) => s.hovered);
  const setHovered = useUI((s) => s.setHovered);
  const reduced = useUI((s) => s.reducedMotion);

  const base = useMemo(() => baseScale(innerW), [innerW]);
  const x = useMemo(() => t.rescaleX(base), [t, base]);
  // Semantic zoom: dots at overview, labelled marks once a year is wide enough to read.
  const pxPerYear = x(2001) - x(2000);
  const labels = pxPerYear >= 34;

  const layout = useMemo(() => {
    let y = AXIS_H + 34;
    const out: { cat: CategoryId; y: number; h: number; items: Item[]; clusters: Cluster[] }[] = [];
    for (const cat of lanes) {
      const list = entries.filter((e) => e.category === cat).sort((a, b) => a.yearNum - b.yearNum || a.n - b.n);
      // Only marks inside the visible window take up rows, so zooming in tightens lanes.
      const raw = list
        .map((e) => {
          const x0 = x(e.yearNum);
          const ms = otherMilestones(e).map((m) => x(m.year));
          const start = Math.min(x0, ...ms) - 7;
          const end = Math.max(labels ? x0 + 12 + e.name.length * 6.3 : x0 + 7, ...ms.map((v) => v + 6));
          return { e, x0, start, end };
        })
        .filter((r) => r.end >= -40 && r.start <= innerW + 40);
      // Density grouping: in dot mode, 4+ systems in one lane and year collapse to a count.
      const clusters: Cluster[] = [];
      const singles: typeof raw = [];
      if (!labels) {
        const byYear = d3.group(raw, (r) => r.e.yearNum);
        for (const [yr, rs] of byYear) {
          if (rs.length >= 4) clusters.push({ ids: rs.map((r) => r.e.id), x: x(yr), row: 0, year: yr });
          else singles.push(...rs);
        }
      } else singles.push(...raw);

      const rows: number[] = [];
      const place = (start: number, end: number) => {
        let r = rows.findIndex((endX) => endX < start - 4);
        if (r === -1) {
          rows.push(end);
          r = rows.length - 1;
        } else rows[r] = end;
        return r;
      };
      const items: Item[] = [];
      const all = [...singles.map((s) => ({ kind: 'item' as const, s, x: s.start })), ...clusters.map((c) => ({ kind: 'cluster' as const, c, x: c.x - 11 }))].sort((a, b) => a.x - b.x);
      for (const a of all) {
        if (a.kind === 'item') items.push({ ...a.s, row: place(a.s.start, a.s.end) });
        else a.c.row = place(a.c.x - 11, a.c.x + 11);
      }
      const rowH = labels ? ROW_H : 16;
      const h = Math.max(rows.length, 1) * rowH + LANE_PAD * 2;
      out.push({ cat, y, h, items, clusters });
      y += h;
    }
    return { lanes: out, height: y + 8, rowH: labels ? ROW_H : 16 };
  }, [x, labels, innerW]);

  // d3-zoom: drag to pan; pinch or ctrl/⌘ + wheel to zoom. Plain wheel scrolls the page.
  useEffect(() => {
    if (!svg.current) return;
    const z = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 24])
      .translateExtent([
        [0, 0],
        [innerW, 1],
      ])
      .extent([
        [0, 0],
        [innerW, 1],
      ])
      .filter((ev: Event) => {
        if (ev.type === 'wheel') return (ev as WheelEvent).ctrlKey || (ev as WheelEvent).metaKey;
        return !(ev as MouseEvent).button;
      })
      .on('zoom', (ev: d3.D3ZoomEvent<SVGSVGElement, unknown>) => setT(ev.transform));
    zoom.current = z;
    const node = svg.current;
    d3.select(node).call(z).on('dblclick.zoom', null);
    return () => {
      d3.select(node).on('.zoom', null);
    };
  }, [innerW]);

  const zoomTo = useCallback(
    (from: number, to: number) => {
      if (!svg.current || !zoom.current) return;
      const k = Math.min(24, Math.max(1, innerW / (base(to) - base(from))));
      const target = d3.zoomIdentity.translate(-base(from) * k, 0).scale(k);
      const sel = d3.select(svg.current);
      if (reduced) sel.call(zoom.current.transform, target);
      else sel.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.current.transform, target);
    },
    [base, innerW, reduced],
  );

  // ?focus=<id>: bring an entry into view and scroll its lane on screen.
  useEffect(() => {
    const e = getEntry(focus);
    if (!e || !innerW) return;
    const c = e.yearNum;
    const id = setTimeout(() => {
      zoomTo(c - 6, c + 7);
      setTimeout(() => document.querySelector(`[data-entry="${e.id}"]`)?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }), 800);
    }, 300);
    return () => clearTimeout(id);
  }, [focus, innerW, zoomTo, reduced]);

  // Keep the play cursor in view when zoomed in.
  useEffect(() => {
    if (playYear == null || t.k <= 1.05) return;
    const px = x(playYear);
    if (px < 40 || px > innerW - 40) {
      const span = x.invert(innerW) - x.invert(0);
      zoomTo(playYear - span * 0.2, playYear + span * 0.8);
    }
  }, [playYear, t.k, x, innerW, zoomTo]);

  const [d0, d1] = [x.invert(0), x.invert(innerW)];
  const activeDecade = t.k < 1.02 ? 'all' : (DECADES.find((d) => d.id !== 'all' && Math.abs(d0 - d.from) < 0.8 && Math.abs(d1 - d.to) < 0.8)?.id ?? null);
  // Ticks: decades in the compressed early zone, finer steps in the main window.
  const ticks = useMemo(() => {
    const visible = (v: number) => x(v) >= -20 && x(v) <= innerW + 20;
    const early = d3.range(Math.ceil(YEAR_MIN / 10) * 10, PRE_END, x(1910) - x(1900) > 70 ? 10 : 20);
    const step = pxPerYear > 60 ? 1 : pxPerYear > 24 ? 2 : 5;
    const main = d3.range(PRE_END, YEAR_MAX, step);
    return [...early, ...main].filter(visible);
  }, [x, innerW, pxPerYear]);
  const cursor = playYear ?? year;
  const dim = (e: Entry) => (cats.length > 0 && !cats.includes(e.category)) || (playYear != null && e.yearNum > playYear);

  return (
    <div className="relative mt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Jump to period">
          {DECADES.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={activeDecade === d.id}
              onClick={() => zoomTo(d.from, d.to)}
              className={clsx('h-8 rounded-full px-3 font-mono text-xs transition-colors', activeDecade === d.id ? 'bg-ink-4 text-paper' : 'text-paper-3 hover:bg-ink-3 hover:text-paper')}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-paper-3">
          <span className="hidden xl:inline">{labels ? 'Drag to pan' : 'Zoom in to read labels'} · pinch or ⌘/Ctrl + scroll to zoom</span>
          <button type="button" aria-label="Zoom out" className="grid h-8 w-8 place-items-center rounded-full border border-line-2 text-paper-2 hover:text-paper" onClick={() => svg.current && zoom.current && d3.select(svg.current).transition().duration(reduced ? 0 : 300).call(zoom.current.scaleBy, 0.6)}>
            −
          </button>
          <button type="button" aria-label="Zoom in" className="grid h-8 w-8 place-items-center rounded-full border border-line-2 text-paper-2 hover:text-paper" onClick={() => svg.current && zoom.current && d3.select(svg.current).transition().duration(reduced ? 0 : 300).call(zoom.current.scaleBy, 1.6)}>
            +
          </button>
        </div>
      </div>

      <div ref={box} className="relative overflow-hidden rounded-3xl border border-line bg-ink-2/40">
        {width > 0 && (
          <svg ref={svg} width={width} height={layout.height} className="block cursor-grab touch-pan-y select-none active:cursor-grabbing" role="img" aria-label="Timeline of surveillance systems by category and year. The Atlas lists the same systems as text.">
            <defs>
              <clipPath id="plot">
                <rect x={LABEL_W} y={0} width={innerW + 24} height={layout.height} />
              </clipPath>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#f2eee6" strokeOpacity=".06" strokeWidth="2" />
              </pattern>
            </defs>

            <g clipPath="url(#plot)">
              <g transform={`translate(${LABEL_W},0)`}>
                {/* Early history, compressed */}
                <rect x={x(YEAR_MIN)} y={AXIS_H} width={Math.max(0, x(PRE_END) - x(YEAR_MIN))} height={layout.height - AXIS_H} fill="url(#hatch)" />
                {x(PRE_END) - x(YEAR_MIN) > 120 && (
                  <text x={x(YEAR_MIN) + 8} y={AXIS_H + 18} className="fill-paper-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                    Earlier foundations · compressed
                  </text>
                )}
                <line x1={x(PRE_END)} x2={x(PRE_END)} y1={AXIS_H - 6} y2={layout.height} stroke="#f2eee6" strokeOpacity=".22" strokeDasharray="3 4" />

                {timelineContext.eras.map((er, i) => {
                  const a = x(Math.max(er.from, PRE_END));
                  const b = x(Math.min(er.to + 1, YEAR_MAX));
                  return (
                    <g key={er.label}>
                      <rect x={a} y={AXIS_H - 22} width={Math.max(0, b - a - 2)} height={2} fill="#f2eee6" fillOpacity={0.12 + i * 0.06} />
                      {b - a > er.label.length * 5.9 + 12 && (
                        <text x={a + 2} y={AXIS_H - 30} className="fill-paper-3 text-[11px]">
                          {er.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {ticks.map((v) => (
                  <g key={v} transform={`translate(${x(v)},0)`}>
                    <line y1={AXIS_H - 6} y2={layout.height} stroke="#f2eee6" strokeOpacity={v % 10 === 0 ? 0.1 : 0.04} />
                    <text y={AXIS_H - 10} x={3} className={clsx('font-mono text-[11px] tabular', v % 10 === 0 ? 'fill-paper-2' : 'fill-paper-3')}>
                      {v}
                    </text>
                  </g>
                ))}
                <rect
                  x={0}
                  y={AXIS_H - 26}
                  width={innerW}
                  height={26}
                  fill="transparent"
                  className="cursor-crosshair"
                  onClick={(ev) => {
                    const r = (ev.currentTarget as SVGRectElement).getBoundingClientRect();
                    setYear(Math.round(x.invert(ev.clientX - r.left)));
                  }}
                >
                  <title>Click to inspect a year</title>
                </rect>

                {/* Law and oversight lane */}
                {timelineContext.context.map((c, i) => {
                  const hidden = playYear != null && c.year > playYear;
                  const stack = timelineContext.context.slice(0, i).filter((o) => o.year === c.year).length;
                  const label = `${c.year} · ${c.label}`;
                  return (
                    <g
                      key={i}
                      transform={`translate(${x(c.year)},${AXIS_H + 12 + stack * 9})`}
                      opacity={hidden ? 0.08 : 1}
                      className="cursor-pointer transition-opacity duration-500"
                      tabIndex={0}
                      role="button"
                      aria-label={label}
                      onMouseEnter={(ev) => setCtxTip({ label, line: c.line, x: ev.clientX, y: ev.clientY })}
                      onMouseLeave={() => setCtxTip(null)}
                      onFocus={(ev) => {
                        const r = (ev.currentTarget as SVGGElement).getBoundingClientRect();
                        setCtxTip({ label, line: c.line, x: r.x, y: r.y });
                      }}
                      onBlur={() => setCtxTip(null)}
                      onClick={() => c.rows[0] && set({ entry: c.rows[0] })}
                      onKeyDown={(ev) => ev.key === 'Enter' && c.rows[0] && set({ entry: c.rows[0] })}
                    >
                      <rect x={-3.5} y={-3.5} width={7} height={7} transform="rotate(45)" fill="none" stroke="#f2eee6" strokeOpacity=".7" />
                    </g>
                  );
                })}

                {layout.lanes.map((lane) => (
                  <g key={lane.cat} opacity={cats.length && !cats.includes(lane.cat) ? 0.22 : 1} className="transition-opacity duration-300">
                    <line x1={x(YEAR_MIN)} x2={x(YEAR_MAX)} y1={lane.y} y2={lane.y} stroke="#f2eee6" strokeOpacity=".07" />
                    {lane.clusters.map((c) => (
                      <g
                        key={c.ids.join()}
                        transform={`translate(${c.x},${lane.y + LANE_PAD + c.row * layout.rowH + layout.rowH / 2})`}
                        className="cursor-zoom-in"
                        tabIndex={0}
                        role="button"
                        opacity={playYear != null && c.year > playYear ? 0.12 : 1}
                        aria-label={`${c.ids.length} systems in ${c.year}. Zoom in to separate them.`}
                        onClick={() => zoomTo(c.year - 4, c.year + 5)}
                        onKeyDown={(ev) => ev.key === 'Enter' && zoomTo(c.year - 4, c.year + 5)}
                      >
                        <title>{c.ids.map((id) => getEntry(id)!.name).join('\n')}</title>
                        <circle r={8.5} fill="#232327" stroke="#f2eee6" strokeOpacity=".55" />
                        <text textAnchor="middle" dy="3.5" className="fill-paper font-mono text-[10px]">
                          {c.ids.length}
                        </text>
                      </g>
                    ))}
                    {lane.items.map((it) => (
                      <Mark
                        key={it.e.id}
                        it={it}
                        y={lane.y + LANE_PAD + it.row * layout.rowH + layout.rowH / 2}
                        x={x}
                        labels={labels}
                        rowH={layout.rowH}
                        dim={dim(it.e)}
                        hot={hovered === it.e.id || focus === it.e.id}
                        onEnter={(ev) => {
                          setHovered(it.e.id);
                          setTip({ e: it.e, x: ev.clientX, y: ev.clientY });
                        }}
                        onLeave={() => {
                          setHovered(null);
                          setTip(null);
                        }}
                        onOpen={() => set({ entry: it.e.id })}
                      />
                    ))}
                  </g>
                ))}

                {cursor != null && (
                  <g transform={`translate(${x(Math.max(cursor, YEAR_MIN))},0)`} className="pointer-events-none">
                    <line y1={AXIS_H - 26} y2={layout.height} stroke="#e8a951" strokeOpacity=".8" />
                    <rect x={-22} y={AXIS_H - 28} width={44} height={16} rx={8} fill="#e8a951" />
                    <text textAnchor="middle" y={AXIS_H - 16.5} className="fill-ink font-mono text-[10px] tabular">
                      {Math.floor(cursor)}
                    </text>
                  </g>
                )}
              </g>
            </g>

            <rect x={0} y={0} width={LABEL_W} height={layout.height} fill="#0e0e10" />
            <line x1={LABEL_W} x2={LABEL_W} y1={0} y2={layout.height} stroke="#f2eee6" strokeOpacity=".08" />
            <text x={20} y={AXIS_H + 15} className="fill-paper-2 text-[12px]">
              Law & oversight
            </text>
            {layout.lanes.map((lane) => (
              <text key={lane.cat} x={20} y={lane.y + LANE_PAD + layout.rowH / 2 + 4} className={clsx('text-[12px]', cats.includes(lane.cat) ? 'fill-paper' : 'fill-paper-2')}>
                {CATEGORIES[lane.cat].short}
              </text>
            ))}
          </svg>
        )}
      </div>

      {year != null && playYear == null && <YearInspector year={year} onClose={() => setYear(null)} />}

      {tip && (
        <div className="pointer-events-none fixed z-[80] w-72 rounded-2xl border border-line-2 bg-ink-3/95 p-4 shadow-2xl backdrop-blur-md" style={{ left: Math.min(tip.x + 16, window.innerWidth - 300), top: tip.y + 16 }}>
          <p className="flex items-center gap-2 text-xs text-paper-3">
            <span className="h-2 w-2 rounded-full" style={{ background: SIGNALS[tip.e.signal].color }} />
            {CATEGORIES[tip.e.category].short}
          </p>
          <p className="mt-1.5 font-medium leading-snug text-paper">{tip.e.name}</p>
          <p className="mt-1 font-mono text-xs text-paper-2">{tip.e.year}</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-paper-2">{tip.e.purpose}</p>
          {otherMilestones(tip.e).map((m, i) => (
            <p key={i} className="mt-1.5 text-xs text-paper-3">
              ○ {m.year}: {m.label} <span className="text-paper-3/80">({MILESTONE_KIND[m.kind]?.toLowerCase()})</span>
            </p>
          ))}
          {tip.e.reportDating && !tip.e.reportDating.agrees && <p className="mt-1.5 text-xs text-sig-visual">The report dates this {tip.e.reportDating.value}.</p>}
          <p className="mt-2 text-[0.6875rem] text-paper-3">Click for details</p>
        </div>
      )}
      {ctxTip && (
        <div className="pointer-events-none fixed z-[80] max-w-xs rounded-xl border border-line-2 bg-ink-3/95 px-3 py-2 text-[0.8125rem] text-paper shadow-2xl" style={{ left: Math.min(ctxTip.x + 14, window.innerWidth - 280), top: ctxTip.y + 14 }}>
          {ctxTip.label}
          <span className="mt-0.5 block font-mono text-[0.6875rem] text-paper-3">Report line {ctxTip.line}</span>
        </div>
      )}
    </div>
  );
}

function Mark({
  it, y, x, labels, rowH, dim, hot, onEnter, onLeave, onOpen,
}: {
  it: Item;
  y: number;
  x: d3.ScaleLinear<number, number>;
  labels: boolean;
  rowH: number;
  dim: boolean;
  hot: boolean;
  onEnter: (ev: { clientX: number; clientY: number }) => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const { e } = it;
  const color = SIGNALS[e.signal].color;
  const cx = it.x0;
  const ms = otherMilestones(e);
  const differs = e.reportDating && !e.reportDating.agrees;
  return (
    <g
      transform={`translate(0,${y})`}
      data-entry={e.id}
      opacity={dim ? 0.12 : 1}
      className="cursor-pointer outline-none transition-opacity duration-500 [&:focus-visible_.ring]:opacity-100"
      tabIndex={0}
      role="button"
      aria-label={`${e.name}, ${e.year}. ${CATEGORIES[e.category].label}.`}
      onMouseEnter={(ev) => onEnter(ev)}
      onMouseMove={(ev) => onEnter(ev)}
      onMouseLeave={onLeave}
      onFocus={(ev) => {
        const r = (ev.currentTarget as SVGGElement).getBoundingClientRect();
        onEnter({ clientX: r.x + 8, clientY: r.y + 8 });
      }}
      onBlur={onLeave}
      onClick={onOpen}
      onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), onOpen())}
    >
      <rect x={it.start} y={-rowH / 2} width={it.end - it.start} height={rowH} fill="transparent" />
      <rect className="ring opacity-0" x={it.start - 2} y={-rowH / 2 + 1} width={it.end - it.start + 4} height={rowH - 2} rx={rowH / 2 - 1} fill="none" stroke="#f2eee6" strokeOpacity=".6" />
      {ms.map((m, i) => (
        <g key={i}>
          <line x1={cx} x2={x(m.year)} y1={0} y2={0} stroke={color} strokeOpacity=".45" strokeDasharray="2 3" />
          <circle cx={x(m.year)} cy={0} r={3.2} fill="#121214" stroke={color} strokeWidth={1.2} />
        </g>
      ))}
      <circle cx={cx} cy={0} r={hot ? 6 : labels ? 4.5 : 3.6} fill={color} />
      {differs && <circle cx={cx} cy={0} r={7.5} fill="none" stroke="#e8a951" strokeOpacity=".8" strokeDasharray="2 2" />}
      {labels && (
        <text x={cx + 10} dy="4" className={clsx('text-[11.5px] transition-colors', hot ? 'fill-paper' : 'fill-paper-2')}>
          {e.name}
        </text>
      )}
    </g>
  );
}

function YearInspector({ year, onClose }: { year: number; onClose: () => void }) {
  const at = events.filter((e) => e.year === year);
  const by = entries.filter((e) => e.yearNum <= year).length;
  return (
    <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Inspecting</p>
          <p className="mt-1 font-mono text-3xl tabular">{year}</p>
          <p className="mt-1 text-sm text-paper-2">
            {by} of {entries.length} systems in the spreadsheet were in place by this year.
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-paper-2 underline decoration-line-3 underline-offset-4 hover:text-paper">
          Close
        </button>
      </div>
      {at.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {at.map((ev: TimelineEvent, i) =>
            ev.type === 'entry' ? (
              <li key={ev.entry.id}>
                <EntryPill id={ev.entry.id} />
              </li>
            ) : (
              <li key={i} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-dashed border-line-3 px-3 text-[0.8125rem] text-paper">
                ◆ {ev.label} <SourceRef line={ev.line} />
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-paper-3">No systems or events are dated to {year}.</p>
      )}
    </div>
  );
}

function Legend() {
  const item = 'flex items-center gap-2.5 text-[0.8125rem] text-paper-2';
  return (
    <div className="mt-6 grid gap-x-8 gap-y-3 rounded-2xl border border-line p-5 sm:grid-cols-2 lg:grid-cols-3">
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="4.5" fill="#f2eee6" /></svg>
        Year in the spreadsheet (color = signal type)
      </p>
      <p className={item}>
        <svg width="34" height="16" aria-hidden="true"><line x1="6" x2="28" y1="8" y2="8" stroke="#f2eee6" strokeOpacity=".45" strokeDasharray="2 3" /><circle cx="6" cy="8" r="4" fill="#f2eee6" /><circle cx="28" cy="8" r="3.2" fill="#121214" stroke="#f2eee6" strokeWidth="1.2" /></svg>
        Report milestone in another year (adoption, law, example)
      </p>
      <p className={item}>
        <svg width="18" height="16" aria-hidden="true"><circle cx="9" cy="8" r="3.6" fill="#f2eee6" /><circle cx="9" cy="8" r="7" fill="none" stroke="#e8a951" strokeDasharray="2 2" /></svg>
        Report dates it differently
      </p>
      <p className={item}>
        <svg width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="#232327" stroke="#f2eee6" strokeOpacity=".55" /><text x="10" y="13.5" textAnchor="middle" fill="#f2eee6" fontSize="10" fontFamily="monospace">4</text></svg>
        Several systems in one year: select to zoom in
      </p>
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><rect x="4.5" y="4.5" width="7" height="7" transform="rotate(45 8 8)" fill="none" stroke="#f2eee6" strokeOpacity=".7" /></svg>
        Law, standard, or oversight (from the report)
      </p>
      <p className={item}>
        <svg width="28" height="16" aria-hidden="true"><rect x="0" y="2" width="28" height="12" fill="url(#legend-hatch)" /><defs><pattern id="legend-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#f2eee6" strokeOpacity=".25" strokeWidth="2" /></pattern></defs></svg>
        Before 1975, drawn compressed
      </p>
      <p className="text-xs leading-relaxed text-paper-3 sm:col-span-2 lg:col-span-3">
        A year marks the earliest practical introduction or documented deployment of the modern form, not invention or widespread adoption, and a
        system does not disappear after its year. More marks in a decade reflect what the research catalogs, not how much surveillance existed then.
      </p>
    </div>
  );
}
