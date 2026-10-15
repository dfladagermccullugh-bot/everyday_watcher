'use client';

import { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import type Graph from 'graphology';
import { useUI } from '@/lib/store';
import { buildGraph, type EdgeKind } from './graph';

type Props = {
  selected: string | null;
  kinds: Record<EdgeKind, boolean>;
  onSelect: (id: string | null) => void;
};

/** WebGL network of all systems and linking keys. Loaded only on wide screens. */
export default function GraphCanvas({ selected, kinds, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const sigma = useRef<Sigma | null>(null);
  const graph = useRef<Graph | null>(null);
  const hovered = useRef<string | null>(null);
  const state = useRef({ selected, kinds });
  state.current = { selected, kinds };
  const reduced = useUI((s) => s.reducedMotion);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current) return;
    const g = buildGraph();
    graph.current = g;
    const renderer = new Sigma(g, container.current, {
      renderLabels: true,
      labelFont: 'Inter, ui-sans-serif, system-ui, sans-serif',
      labelSize: 12,
      labelWeight: '400',
      labelColor: { color: '#bdb7ac' },
      labelDensity: 0.55,
      labelGridCellSize: 90,
      labelRenderedSizeThreshold: 7,
      stagePadding: 40,
      zIndex: true,
      minCameraRatio: 0.12,
      maxCameraRatio: 2.5,
      defaultDrawNodeHover: (ctx, data, settings) => {
        const size = settings.labelSize;
        ctx.font = `500 ${size}px ${settings.labelFont}`;
        const w = ctx.measureText(data.label ?? '').width;
        const x = data.x + data.size + 6;
        const y = data.y;
        ctx.fillStyle = 'rgba(25,25,28,0.95)';
        ctx.strokeStyle = 'rgba(242,238,230,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x - 6, y - size / 2 - 6, w + 12, size + 12, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f2eee6';
        ctx.fillText(data.label ?? '', x, y + size / 3);
        ctx.beginPath();
        ctx.arc(data.x, data.y, data.size + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#f2eee6';
        ctx.stroke();
      },
      nodeReducer: (node, data) => {
        const { selected: sel } = state.current;
        const res: Record<string, unknown> = { ...data };
        const focus = sel ?? hovered.current;
        if (focus) {
          const isNeighbor = node === focus || g.areNeighbors(node, focus);
          if (!isNeighbor) {
            res.color = '#1f1f23';
            res.size = Math.min(data.size as number, 3);
            res.label = '';
            res.zIndex = 0;
          } else {
            res.forceLabel = true;
            res.zIndex = 2;
          }
          if (node === focus) {
            res.highlighted = true;
            res.size = (data.size as number) * 1.5;
          }
        }
        return res;
      },
      edgeReducer: (edge, data) => {
        const { selected: sel, kinds: k } = state.current;
        const res: Record<string, unknown> = { ...data };
        if (!k[data.kind as EdgeKind]) res.hidden = true;
        const focus = sel ?? hovered.current;
        if (focus && !g.hasExtremity(edge, focus)) res.hidden = true;
        if (focus && g.hasExtremity(edge, focus) && (data.kind === 'key' || data.kind === 'paragraph')) res.color = 'rgba(242,238,230,0.35)';
        return res;
      },
    });
    sigma.current = renderer;

    renderer.on('clickNode', ({ node }) => onSelectRef.current(node));
    renderer.on('clickStage', () => onSelectRef.current(null));
    renderer.on('enterNode', ({ node }) => {
      hovered.current = node;
      container.current!.style.cursor = 'pointer';
      renderer.refresh({ skipIndexation: true });
    });
    renderer.on('leaveNode', () => {
      hovered.current = null;
      container.current!.style.cursor = '';
      renderer.refresh({ skipIndexation: true });
    });

    return () => {
      renderer.kill();
      sigma.current = null;
    };
  }, []);

  // Re-render on selection / filter change and glide the camera to the selection.
  useEffect(() => {
    const r = sigma.current;
    if (!r) return;
    r.refresh({ skipIndexation: true });
    const cam = r.getCamera();
    if (selected && graph.current?.hasNode(selected)) {
      const d = r.getNodeDisplayData(selected);
      if (d) cam.animate({ x: d.x, y: d.y, ratio: Math.min(cam.ratio, 0.55) }, { duration: reduced ? 0 : 650 });
    }
  }, [selected, kinds, reduced]);

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="absolute inset-0" role="img" aria-label="Network of surveillance systems and linking keys. The panel beside it lists the same connections as text." />
      <div className="absolute bottom-4 left-4 flex gap-1.5">
        {[
          { l: 'Zoom in', f: () => sigma.current?.getCamera().animatedZoom({ duration: 300 }) },
          { l: 'Zoom out', f: () => sigma.current?.getCamera().animatedUnzoom({ duration: 300 }) },
          { l: 'Reset view', f: () => sigma.current?.getCamera().animatedReset({ duration: 400 }) },
        ].map((b) => (
          <button key={b.l} type="button" onClick={b.f} aria-label={b.l} className="grid h-9 min-w-9 place-items-center rounded-full border border-line-2 bg-ink/80 px-3 text-xs text-paper-2 backdrop-blur hover:text-paper">
            {b.l === 'Zoom in' ? '+' : b.l === 'Zoom out' ? '−' : 'Reset'}
          </button>
        ))}
      </div>
    </div>
  );
}
