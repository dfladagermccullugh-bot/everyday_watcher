'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORIES, SIGNALS, timelineContext, getEntry, type Entry, type CategoryId } from '@/lib/data';
import { useQueryState } from '@/lib/url-state';
import { useElementSize, useMediaQuery, useMounted } from '@/lib/hooks';
import { useUI } from '@/lib/store';
import { Chip, SourceRef, EntryPill } from '../ui';
import { lanes, placed, YEAR_MIN, YEAR_MAX, PRE_END, revealYear, events, eventYears, markKindLabel, type TimelineEvent } from './model';
import { TimelineList } from './TimelineList';
import { Unplaced } from './Unplaced';

const LABEL_W = 168;
const AXIS_H = 64;
const ROW_H = 24;
const LANE_PAD = 14;
const DECADES = [
  { id: 'all', label: 'All', from: YEAR_MIN, to: YEAR_MAX },
  { id: 'pre', label: 'Before 1975', from: YEAR_MIN, to: 1980 },
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
            <Chip key={c} active={cats.includes(c)} onClick={() => toggleCat(c)} count={placed.filter((e) => e.category === c).length}>
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
      <Unplaced />
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
        let next = reduced ? (nextEvent ?? YEAR_MAX) : cur + dt * 3.2;
        if (!reduced && nextEvent != null && next >= nextEvent && lastHeldYear !== nextEvent) {
          next = nextEvent;
          lastHeldYear = nextEvent;
          hold = 1.1;
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
  const shown = year < PRE_END ? events.filter((e) => e.type === 'entry' && e.entry.pos.kind === 'pre') : here;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
        <p className="w-36 shrink-0 font-mono text-5xl leading-none text-paper tabular">{year < PRE_END ? 'pre‑75' : y}</p>
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

type Item = { e: Entry; x0: number; x1: number; labelEnd: number; row: number };
type Cluster = { ids: string[]; x: number; row: number; from: number; to: number };

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

  const base = useMemo(() => d3.scaleLinear().domain([YEAR_MIN, YEAR_MAX]).range([0, innerW]), [innerW]);
  const x = useMemo(() => t.rescaleX(base), [t, base]);

  // Pack labels into rows per lane so nothing overlaps; cluster dense groups at low zoom.
  const layout = useMemo(() => {
    let y = AXIS_H + 34;
    const out: { cat: CategoryId; y: number; h: number; items: Item[]; clusters: Cluster[] }[] = [];
    for (const cat of lanes) {
      const list = placed.filter((e) => e.category === cat).sort((a, b) => a.pos.start! - b.pos.start! || a.n - b.n);
      const raw = list.map((e) => {
        const isPre = e.pos.kind === 'pre';
        const x0 = isPre ? x(YEAR_MIN + 1.2) : x(e.pos.start!);
        const x1 = isPre ? x0 : x(e.pos.end! + (e.pos.kind === 'range' ? 1 : 0));
        return { e, x0, x1, labelEnd: Math.max(x1, x0) + 14 + e.name.length * 6.3 };
      });
      // Density grouping: 3+ marks within 10px collapse at overview zoom.
      const clusters: Cluster[] = [];
      const singles: typeof raw = [];
      if (t.k < 2.2) {
        let i = 0;
        while (i < raw.length) {
          let j = i + 1;
          while (j < raw.length && raw[j].x0 - raw[i].x0 < 10) j++;
          if (j - i >= 3) clusters.push({ ids: raw.slice(i, j).map((r) => r.e.id), x: raw[i].x0, row: 0, from: raw[i].e.pos.start!, to: raw[j - 1].e.pos.start! });
          else singles.push(...raw.slice(i, j));
          i = j;
        }
      } else singles.push(...raw);

      const rows: number[] = [];
      const place = (start: number, end: number) => {
        let r = rows.findIndex((endX) => endX < start - 8);
        if (r === -1) {
          rows.push(end);
          r = rows.length - 1;
        } else rows[r] = end;
        return r;
      };
      const items: Item[] = [];
      const all = [...singles.map((s) => ({ kind: 'item' as const, s, x: s.x0 })), ...clusters.map((c) => ({ kind: 'cluster' as const, c, x: c.x }))].sort((a, b) => a.x - b.x);
      for (const a of all) {
        if (a.kind === 'item') items.push({ ...a.s, row: place(a.s.x0 - 6, a.s.labelEnd) });
        else a.c.row = place(a.c.x - 10, a.c.x + 120);
      }
      const h = Math.max(rows.length, 1) * ROW_H + LANE_PAD * 2;
      out.push({ cat, y, h, items, clusters });
      y += h;
    }
    return { lanes: out, height: y + 8 };
  }, [x, t.k]);

  // d3-zoom: drag to pan; pinch or ctrl/⌘ + wheel to zoom. Plain wheel scrolls the page.
  useEffect(() => {
    if (!svg.current) return;
    const z = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 16])
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
    d3.select(svg.current).call(z).on('dblclick.zoom', null);
    return () => {
      d3.select(svg.current).on('.zoom', null);
    };
  }, [innerW]);

  const zoomTo = useCallback(
    (from: number, to: number) => {
      if (!svg.current || !zoom.current) return;
      const k = Math.min(16, Math.max(1, (YEAR_MAX - YEAR_MIN) / (to - from)));
      const tx = -base(from) * k;
      const target = d3.zoomIdentity.translate(tx, 0).scale(k);
      const sel = d3.select(svg.current);
      if (reduced) sel.call(zoom.current.transform, target);
      else sel.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.current.transform, target);
    },
    [base, reduced],
  );

  // ?focus=<id>: bring an entry into view.
  useEffect(() => {
    const e = getEntry(focus);
    if (!e || e.pos.start == null || !innerW) return;
    const c = e.pos.kind === 'pre' ? 1969 : e.pos.start;
    const id = setTimeout(() => {
      zoomTo(c - 6, c + 6);
      setTimeout(() => document.querySelector(`[data-entry="${e.id}"]`)?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }), 800);
    }, 300);
    return () => clearTimeout(id);
  }, [focus, innerW, zoomTo, reduced]);

  // Keep the play cursor in view when zoomed in.
  useEffect(() => {
    if (playYear == null || t.k <= 1.05) return;
    const px = x(playYear);
    if (px < 40 || px > innerW - 40) {
      const span = (YEAR_MAX - YEAR_MIN) / t.k;
      zoomTo(playYear - span * 0.2, playYear + span * 0.8);
    }
  }, [playYear, t.k, x, innerW, zoomTo]);

  const activeDecade = DECADES.find((d) => Math.abs(x.domain()[0] - d.from) < 0.6 && Math.abs(x.domain()[1] - d.to) < 0.6)?.id ?? (t.k < 1.02 ? 'all' : null);
  const ticks = x.ticks(Math.max(4, Math.round(innerW / 90))).filter((v) => Number.isInteger(v));
  const cursor = playYear ?? year;
  const dim = (e: Entry) => (cats.length > 0 && !cats.includes(e.category)) || (playYear != null && revealYear(e) > playYear);

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
              className={clsx(
                'h-8 rounded-full px-3 font-mono text-xs transition-colors',
                activeDecade === d.id ? 'bg-ink-4 text-paper' : 'text-paper-3 hover:bg-ink-3 hover:text-paper',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-paper-3">
          <span className="hidden xl:inline">Drag to pan · pinch or ⌘/Ctrl + scroll to zoom</span>
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
          <svg ref={svg} width={width} height={layout.height} className="block cursor-grab touch-pan-y select-none active:cursor-grabbing" role="img" aria-label="Timeline of dated surveillance systems by category. Use the list below the chart or the Atlas for a text version.">
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
                {/* Pre-1975 zone */}
                <rect x={x(YEAR_MIN)} y={AXIS_H} width={Math.max(0, x(PRE_END) - x(YEAR_MIN))} height={layout.height - AXIS_H} fill="url(#hatch)" />
                <text x={x(YEAR_MIN) + 8} y={AXIS_H + 18} className="fill-paper-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                  Before the window
                </text>

                {/* Eras from the report */}
                {timelineContext.eras.map((er, i) => (
                  <g key={er.label}>
                    <rect x={x(Math.max(er.from, PRE_END))} y={AXIS_H - 22} width={Math.max(0, x(er.to + 1) - x(Math.max(er.from, PRE_END))) - 2} height={2} fill="#f2eee6" fillOpacity={0.12 + i * 0.06} />
                    {x(er.to + 1) - x(Math.max(er.from, PRE_END)) > er.label.length * 5.9 + 12 && (
                      <text x={x(Math.max(er.from, PRE_END)) + 2} y={AXIS_H - 30} className="fill-paper-3 text-[11px]">
                        {er.label}
                      </text>
                    )}
                  </g>
                ))}

                {/* Year grid + axis */}
                {ticks.map((v) => (
                  <g key={v} transform={`translate(${x(v)},0)`}>
                    <line y1={AXIS_H - 6} y2={layout.height} stroke="#f2eee6" strokeOpacity={v % 10 === 0 ? 0.1 : 0.04} />
                    <text y={AXIS_H - 10} x={3} className={clsx('font-mono text-[11px] tabular', v % 10 === 0 ? 'fill-paper-2' : 'fill-paper-3')}>
                      {v}
                    </text>
                  </g>
                ))}
                {/* Click strip on the axis sets the inspected year */}
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
                  const cx = x(c.year);
                  const hidden = playYear != null && c.year > playYear;
                  const stack = timelineContext.context.slice(0, i).filter((o) => o.year === c.year).length;
                  return (
                    <g
                      key={i}
                      transform={`translate(${cx},${AXIS_H + 12 + stack * 9})`}
                      opacity={hidden ? 0.08 : 1}
                      className="cursor-pointer transition-opacity duration-500"
                      tabIndex={0}
                      role="button"
                      aria-label={`${c.year}: ${c.label}`}
                      onMouseEnter={(ev) => setCtxTip({ label: `${c.year} · ${c.label}`, line: c.line, x: ev.clientX, y: ev.clientY })}
                      onMouseLeave={() => setCtxTip(null)}
                      onFocus={(ev) => {
                        const r = (ev.currentTarget as SVGGElement).getBoundingClientRect();
                        setCtxTip({ label: `${c.year} · ${c.label}`, line: c.line, x: r.x, y: r.y });
                      }}
                      onBlur={() => setCtxTip(null)}
                      onClick={() => c.rows[0] && set({ entry: c.rows[0] })}
                      onKeyDown={(ev) => ev.key === 'Enter' && c.rows[0] && set({ entry: c.rows[0] })}
                    >
                      <rect x={-3.5} y={-3.5} width={7} height={7} transform="rotate(45)" fill="none" stroke="#f2eee6" strokeOpacity=".7" />
                    </g>
                  );
                })}

                {/* Lanes */}
                {layout.lanes.map((lane) => (
                  <g key={lane.cat} opacity={cats.length && !cats.includes(lane.cat) ? 0.22 : 1} className="transition-opacity duration-300">
                    <line x1={x(YEAR_MIN)} x2={x(YEAR_MAX)} y1={lane.y} y2={lane.y} stroke="#f2eee6" strokeOpacity=".07" />
                    {lane.clusters.map((c) => (
                      <g
                        key={c.ids.join()}
                        transform={`translate(${c.x},${lane.y + LANE_PAD + c.row * ROW_H + ROW_H / 2})`}
                        className="cursor-zoom-in"
                        tabIndex={0}
                        role="button"
                        aria-label={`${c.ids.length} systems around ${c.from}. Zoom in to separate them.`}
                        onClick={() => zoomTo(c.from - 3, c.to + 7)}
                        onKeyDown={(ev) => ev.key === 'Enter' && zoomTo(c.from - 3, c.to + 7)}
                      >
                        <circle r={9} fill="#232327" stroke="#f2eee6" strokeOpacity=".5" />
                        <text textAnchor="middle" dy="3.5" className="fill-paper font-mono text-[10px]">
                          {c.ids.length}
                        </text>
                        <text x={14} dy="4" className="fill-paper-2 text-[11.5px]">
                          {c.ids.map((id) => getEntry(id)!.name).slice(0, 2).join(', ')}
                          {c.ids.length > 2 ? ` +${c.ids.length - 2}` : ''}
                        </text>
                      </g>
                    ))}
                    {lane.items.map((it) => (
                      <Mark
                        key={it.e.id}
                        it={it}
                        y={lane.y + LANE_PAD + it.row * ROW_H + ROW_H / 2}
                        x={x}
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
                      {cursor < PRE_END ? 'pre' : Math.floor(cursor)}
                    </text>
                  </g>
                )}
              </g>
            </g>

            {/* Lane labels (drawn last so they sit above panned marks) */}
            <rect x={0} y={0} width={LABEL_W} height={layout.height} fill="#0e0e10" />
            <line x1={LABEL_W} x2={LABEL_W} y1={0} y2={layout.height} stroke="#f2eee6" strokeOpacity=".08" />
            <text x={20} y={AXIS_H + 15} className="fill-paper-2 text-[12px]">
              Law & oversight
            </text>
            {layout.lanes.map((lane) => (
              <text key={lane.cat} x={20} y={lane.y + LANE_PAD + ROW_H / 2 + 4} className={clsx('text-[12px]', cats.includes(lane.cat) ? 'fill-paper' : 'fill-paper-2')}>
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
          <p className="mt-1 font-mono text-xs text-paper-2">{markKindLabel(tip.e)}</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-paper-2">{tip.e.purpose}</p>
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
  it, y, x, dim, hot, onEnter, onLeave, onOpen,
}: {
  it: Item;
  y: number;
  x: d3.ScaleLinear<number, number>;
  dim: boolean;
  hot: boolean;
  onEnter: (ev: { clientX: number; clientY: number }) => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const { e } = it;
  const color = SIGNALS[e.signal].color;
  const p = e.pos;
  const cx = it.x0;
  return (
    <g
      transform={`translate(0,${y})`}
      data-entry={e.id}
      opacity={dim ? 0.12 : 1}
      className="cursor-pointer outline-none transition-opacity duration-500 [&:focus-visible_.ring]:opacity-100"
      tabIndex={0}
      role="button"
      aria-label={`${e.name}. ${markKindLabel(e)}. ${CATEGORIES[e.category].label}.`}
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
      <rect x={cx - 8} y={-ROW_H / 2} width={it.labelEnd - cx + 8} height={ROW_H} fill="transparent" />
      <rect className="ring opacity-0" x={cx - 10} y={-ROW_H / 2 + 1} width={it.labelEnd - cx + 14} height={ROW_H - 2} rx={11} fill="none" stroke="#f2eee6" strokeOpacity=".6" />
      {p.kind === 'range' && <rect x={cx} y={-3} width={Math.max(4, it.x1 - cx)} height={6} rx={3} fill={color} fillOpacity={hot ? 0.5 : 0.24} stroke={color} strokeOpacity=".5" strokeWidth={0.75} />}
      {p.kind === 'staged' &&
        p.stages!.map((s, i) => (
          <g key={i}>
            {i > 0 && <line x1={x(p.stages![i - 1].year)} x2={x(s.year)} y1={0} y2={0} stroke={color} strokeOpacity=".6" />}
            <circle cx={x(s.year)} cy={0} r={4} fill={i === 0 ? color : '#121214'} stroke={color} strokeWidth={1.4} />
          </g>
        ))}
      {p.kind === 'exact' && <circle cx={cx} cy={0} r={hot ? 6 : 4.5} fill={color} />}
      {p.kind === 'approx' && (
        <>
          <circle cx={cx} cy={0} r={4} fill={color} />
          <circle cx={cx} cy={0} r={7.5} fill="none" stroke={color} strokeOpacity=".55" strokeDasharray="2 2" />
        </>
      )}
      {p.kind === 'milestone' && <circle cx={cx} cy={0} r={4.5} fill="#121214" stroke={color} strokeWidth={1.5} strokeDasharray={p.milestoneKind === 'adoption' ? '2 1.6' : undefined} />}
      {p.kind === 'pre' && <rect x={cx - 4} y={-4} width={8} height={8} rx={1.5} fill={color} />}
      {p.kind === 'range' && <circle cx={cx} cy={0} r={3} fill={color} />}
      <text x={Math.max(it.x1, cx) + (p.kind === 'approx' ? 12 : 10)} dy="4" className={clsx('text-[11.5px] transition-colors', hot ? 'fill-paper' : 'fill-paper-2')}>
        {e.name}
      </text>
    </g>
  );
}

function YearInspector({ year, onClose }: { year: number; onClose: () => void }) {
  const at = events.filter((e) => e.year === year);
  const by = placed.filter((e) => e.pos.kind !== 'pre' && e.pos.start! <= year).length + placed.filter((e) => e.pos.kind === 'pre').length;
  return (
    <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Inspecting</p>
          <p className="mt-1 font-mono text-3xl tabular">{year}</p>
          <p className="mt-1 text-sm text-paper-2">
            {by} of {placed.length} dated systems are placed at or before this year.
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
        <p className="mt-4 text-sm text-paper-3">No dated events in the supplied research for {year}.</p>
      )}
    </div>
  );
}

function Legend() {
  const item = 'flex items-center gap-2.5 text-[0.8125rem] text-paper-2';
  return (
    <div className="mt-6 grid gap-x-8 gap-y-3 rounded-2xl border border-line p-5 sm:grid-cols-2 lg:grid-cols-4">
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="4.5" fill="#f2eee6" /></svg>
        Year in the CSV
      </p>
      <p className={item}>
        <svg width="18" height="16" aria-hidden="true"><circle cx="9" cy="8" r="3.5" fill="#f2eee6" /><circle cx="9" cy="8" r="7" fill="none" stroke="#f2eee6" strokeOpacity=".55" strokeDasharray="2 2" /></svg>
        Approximate year
      </p>
      <p className={item}>
        <svg width="28" height="16" aria-hidden="true"><rect x="2" y="5" width="24" height="6" rx="3" fill="#f2eee6" fillOpacity=".25" stroke="#f2eee6" strokeOpacity=".5" strokeWidth=".75" /></svg>
        Approximate span (e.g. “2000s”)
      </p>
      <p className={item}>
        <svg width="28" height="16" aria-hidden="true"><line x1="5" x2="23" y1="8" y2="8" stroke="#f2eee6" strokeOpacity=".6" /><circle cx="5" cy="8" r="3.5" fill="#f2eee6" /><circle cx="23" cy="8" r="3.5" fill="#121214" stroke="#f2eee6" strokeWidth="1.4" /></svg>
        Staged (pilot → national)
      </p>
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="4.5" fill="none" stroke="#f2eee6" strokeWidth="1.5" /></svg>
        Report milestone, no CSV year
      </p>
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="4.5" fill="none" stroke="#f2eee6" strokeWidth="1.5" strokeDasharray="2 1.6" /></svg>
        Adoption milestone, not first use
      </p>
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1.5" fill="#f2eee6" /></svg>
        Pre-1975
      </p>
      <p className={item}>
        <svg width="16" height="16" aria-hidden="true"><rect x="4.5" y="4.5" width="7" height="7" transform="rotate(45 8 8)" fill="none" stroke="#f2eee6" strokeOpacity=".7" /></svg>
        Law, standard, or oversight
      </p>
      <p className="text-xs leading-relaxed text-paper-3 sm:col-span-2 lg:col-span-4">
        A date marks the first documented deployment of the modern form, not invention or widespread adoption, and a system does not disappear after its
        date. More marks in a decade reflect what the research dates, not how much surveillance existed then.
      </p>
    </div>
  );
}
