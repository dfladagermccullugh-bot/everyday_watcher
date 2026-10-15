'use client';

import Link from 'next/link';
import clsx from 'clsx';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SIGNALS, quote, getEntry, type SignalId, type Entry, type SourceFile, type Scope, SCOPES } from '@/lib/data';
import { sourceHref, sourceName, sourceUnit } from '@/lib/format';
import { useOpenEntry } from '@/lib/url-state';
import { useUI } from '@/lib/store';

export function SignalDot({ signal, size = 8, className }: { signal: SignalId; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx('inline-block shrink-0 rounded-full', className)}
      style={{ width: size, height: size, background: SIGNALS[signal].color }}
    />
  );
}

/** Scope is shown by shape, not color, so it reads without color vision. */
export function ScopeGlyph({ scope, size = 10 }: { scope: Scope; size?: number }) {
  const r = size / 2 - 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      {scope === 'c' && <circle cx={size / 2} cy={size / 2} r={r} fill="currentColor" />}
      {scope === 'k' && <circle cx={size / 2} cy={size / 2} r={r - 0.5} fill="none" stroke="currentColor" strokeWidth="1.3" />}
      {scope === 'l' && <circle cx={size / 2} cy={size / 2} r={r - 0.5} fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1.6" />}
    </svg>
  );
}

export function ScopeLabel({ scope }: { scope: Scope }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-paper-2">
      <ScopeGlyph scope={scope} />
      {SCOPES[scope].label}
    </span>
  );
}

export function YearBadge({ entry, className }: { entry: Entry; className?: string }) {
  const differs = entry.reportDating && !entry.reportDating.agrees;
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-full border border-line-2 px-2 py-0.5 font-mono text-[0.6875rem] tabular leading-4 text-paper-2', className)}
      title={differs ? `The report dates this ${entry.reportDating!.value}` : undefined}
    >
      {entry.year}
      {differs && <span aria-label="Report dates this differently" className="text-sig-visual">*</span>}
    </span>
  );
}

export function BasisBadge({ basis }: { basis: 'documented' | 'illustrative' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em]',
        basis === 'documented' ? 'bg-paper/10 text-paper' : 'border border-dashed border-ill/60 text-ill',
      )}
    >
      {basis === 'documented' ? 'Documented' : 'Illustrative'}
    </span>
  );
}

/** A numbered reference to a line in the supplied files, with the quoted line on hover. */
export function SourceRef({ file = 'report', line, className }: { file?: SourceFile; line: number; className?: string }) {
  const q = quote(file, line);
  const label = `${sourceName(file)} ${sourceUnit(file)} ${line}`;
  const link = (
    <Link
      href={sourceHref(file, line)}
      className={clsx(
        'inline-flex items-center gap-1 rounded-md font-mono text-[0.6875rem] text-paper-3 underline decoration-line-2 underline-offset-[3px] transition-colors hover:text-paper hover:decoration-paper-3',
        className,
      )}
    >
      <span aria-hidden="true">¶</span>
      {label}
    </Link>
  );
  if (!q) return link;
  return (
    <Tooltip.Provider delayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            collisionPadding={16}
            className="z-[90] max-w-sm rounded-xl border border-line-2 bg-ink-3/95 p-3 text-[0.8125rem] leading-relaxed text-paper-2 shadow-2xl backdrop-blur-md"
          >
            {q.title && <span className="font-medium text-paper">{q.title}. </span>}
            {q.text.length > 360 ? `${q.text.slice(0, 360)}…` : q.text}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

/** Inline pill that opens an entry in the shared drawer. */
export function EntryPill({ id, scope, className, showYear }: { id: string; scope?: Scope; className?: string; showYear?: boolean }) {
  const e = getEntry(id);
  const open = useOpenEntry();
  const setHovered = useUI((s) => s.setHovered);
  if (!e) return null;
  return (
    <button
      type="button"
      onClick={() => open(e.id)}
      onMouseEnter={() => setHovered(e.id)}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered(e.id)}
      onBlur={() => setHovered(null)}
      className={clsx(
        'group inline-flex min-h-8 items-center gap-2 rounded-full border border-line-2 bg-ink-2/60 px-3 py-1 text-left text-[0.8125rem] text-paper-2 transition-[color,border-color,background-color] hover:border-line-3 hover:bg-ink-3 hover:text-paper',
        className,
      )}
    >
      <SignalDot signal={e.signal} />
      <span className="leading-tight">{e.name}</span>
      {scope && (
        <span className="text-paper-3" title={SCOPES[scope].label}>
          <ScopeGlyph scope={scope} size={9} />
          <span className="sr-only">({SCOPES[scope].label})</span>
        </span>
      )}
      {showYear && <span className="font-mono text-[0.6875rem] text-paper-3 tabular">{e.year}</span>}
    </button>
  );
}

export function PageIntro({ eyebrow, title, children, className }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('max-w-3xl', className)}>
      <p className="eyebrow animate-rise">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-title text-balance text-paper animate-rise [animation-delay:60ms]">{title}</h1>
      {children && <div className="mt-5 text-[1.0625rem] leading-relaxed text-paper-2 text-pretty animate-rise [animation-delay:120ms]">{children}</div>}
    </div>
  );
}

export function Shell({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return <div className={clsx('mx-auto px-4 sm:px-6 lg:px-10', wide ? 'max-w-[1600px]' : 'max-w-[1440px]', className)}>{children}</div>;
}

export function Chip({
  active,
  onClick,
  children,
  count,
  className,
  ...rest
}: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number; className?: string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] transition-[background-color,border-color,color] duration-200',
        active ? 'border-paper bg-paper text-ink' : 'border-line-2 text-paper-2 hover:border-line-3 hover:text-paper',
        count === 0 && !active && 'opacity-45',
        className,
      )}
      {...rest}
    >
      {children}
      {count != null && <span className={clsx('font-mono text-[0.6875rem] tabular', active ? 'text-ink/60' : 'text-paper-3')}>{count}</span>}
    </button>
  );
}
