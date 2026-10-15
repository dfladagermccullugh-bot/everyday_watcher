'use client';

import Link from 'next/link';
import { useState } from 'react';
import clsx from 'clsx';
import {
  CATEGORIES, SIGNALS, ACTORS, SCOPES, day, flows, keyById, quote, citationById, relationsFor, siblingsOf, getEntry,
  type Entry,
} from '@/lib/data';
import { MILESTONE_KIND, purposeBasisText, yearBasisText, yearLabel } from '@/lib/format';
import { BasisBadge, EntryPill, ScopeLabel, SignalDot, SourceRef } from './ui';

const TYPE_VERB: Record<string, [string, string]> = {
  feeds: ['Feeds into', 'Fed by'],
  extends: ['Extended by', 'Extends'],
  succeeds: ['Succeeded by', 'Succeeds'],
  authorizes: ['Authorizes', 'Authorized by'],
  alternative: ['Alternative to', 'Alternative to'],
  combines: ['Combined with', 'Combined with'],
};

export function EntryDetail({ entry: e, headingLevel = 'h2' }: { entry: Entry; headingLevel?: 'h1' | 'h2' }) {
  const Heading = headingLevel;
  const para = quote('report', e.line);
  const rels = relationsFor(e.id);
  const documented = rels.filter((r) => r.basis === 'documented');
  const illustrative = rels.filter((r) => r.basis === 'illustrative');
  const siblings = siblingsOf(e);
  const placed = e.pos.start != null;

  return (
    <article className="text-paper">
      <p className="eyebrow">
        No. {String(e.n).padStart(3, '0')} · {CATEGORIES[e.category].label}
      </p>
      <Heading className="mt-3 font-serif text-[2.4rem] leading-[1.02] text-balance sm:text-[2.9rem]">{e.name}</Heading>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-paper-2">
        <span className="inline-flex items-center gap-2">
          <SignalDot signal={e.signal} size={9} />
          {SIGNALS[e.signal].label} signal
        </span>
        <span className="text-paper-3">·</span>
        <span>{ACTORS[e.actor]}</span>
        <span className="text-paper-3">·</span>
        <span className="text-paper-3">{e.section}</span>
      </div>

      <section className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <h3 className="eyebrow">Purpose</h3>
          <p className="mt-2 text-[1.1875rem] leading-snug text-paper text-pretty">{e.purpose}</p>
          <p className={clsx('mt-2 text-xs leading-relaxed', e.purposeBasis === 'csv' ? 'text-paper-3' : 'text-ill/90')}>{purposeBasisText(e)}</p>
        </div>
        <div className="sm:min-w-[11rem] sm:border-l sm:border-line sm:pl-6">
          <h3 className="eyebrow">Implementation year</h3>
          <p className={clsx('mt-2 font-mono text-[1.35rem] leading-tight tabular', e.year ? 'text-paper' : 'text-paper-3')}>{yearLabel(e)}</p>
          {e.yearSource && <SourceRef file={e.yearSource.file} line={e.yearSource.line} className="mt-1.5" />}
        </div>
      </section>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-paper-3">{yearBasisText(e)}</p>

      {e.milestones.length > 0 && (
        <section className="mt-7">
          <h3 className="eyebrow">Dated milestones in the research</h3>
          <ol className="mt-3 border-l border-line-2">
            {e.milestones.map((m, i) => (
              <li key={i} className="relative pb-3 pl-5 last:pb-0">
                <span className="absolute -left-[4.5px] top-[7px] h-2 w-2 rounded-full border border-paper-2 bg-ink" />
                <p className="text-sm text-paper">
                  <span className="mr-2 font-mono tabular text-paper-2">{m.year}</span>
                  {m.label}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-paper-3">
                  {MILESTONE_KIND[m.kind] ?? m.kind}
                  <SourceRef file={m.file} line={m.line} />
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {para && (
        <section className="mt-8">
          <h3 className="eyebrow">From the report</h3>
          <blockquote className="mt-3 rounded-2xl border border-line bg-ink-2 p-5">
            {para.title && <p className="font-serif text-xl leading-tight text-paper">{para.title}</p>}
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-paper-2 text-pretty">{para.text}</p>
            <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <SourceRef line={e.line} />
              {para.cites.map((c) => (
                <span key={c} className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] text-paper-3" title={`Citation token ${c}`}>
                  {citationById.get(c)?.label ?? c}
                </span>
              ))}
            </footer>
          </blockquote>
        </section>
      )}

      {e.noteLines.length > 0 && <DateNotes lines={e.noteLines} />}

      {(documented.length > 0 || illustrative.length > 0) && (
        <section className="mt-8">
          <h3 className="eyebrow">Relationships</h3>
          <ul className="mt-3 space-y-3">
            {[...documented, ...illustrative].map((r, i) => {
              const outgoing = r.source === e.id;
              const other = getEntry(outgoing ? r.target : r.source)!;
              const verb = TYPE_VERB[r.type]?.[outgoing ? 0 : 1] ?? r.type;
              return (
                <li key={i} className={clsx('rounded-xl border p-3.5', r.basis === 'documented' ? 'border-line' : 'border-dashed border-ill/40')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-paper-3">{verb}</span>
                    <EntryPill id={other.id} />
                    <BasisBadge basis={r.basis} />
                  </div>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-paper-2">{r.note}</p>
                  <SourceRef line={r.line} className="mt-1.5" />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-8">
          <h3 className="eyebrow">Described in the same paragraph</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <EntryPill key={s.id} id={s.id} />
            ))}
          </div>
        </section>
      )}

      {(e.keys.length > 0 || e.moments.length > 0 || e.flows.length > 0) && (
        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          {e.keys.length > 0 && (
            <div>
              <h3 className="eyebrow">Linking keys</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {e.keys.map((k) => (
                  <li key={k}>
                    <Link className="text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-paper" href={`/connections/?node=${k}`}>
                      {keyById.get(k)?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(e.moments.length > 0 || e.flows.length > 0) && (
            <div>
              <h3 className="eyebrow">Appears in</h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {e.moments.map((m) => {
                  const moment = day.find((d) => d.id === m.id)!;
                  return (
                    <li key={m.id} className="flex flex-wrap items-center gap-x-3">
                      <Link className="text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-paper" href={`/#moment-${m.id}`}>
                        {moment.time} · {moment.title}
                      </Link>
                      <span className="text-xs">
                        <ScopeLabel scope={m.scope} />
                      </span>
                    </li>
                  );
                })}
                {e.flows.map((f) => (
                  <li key={f}>
                    <Link className="text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-paper" href={`/follow/?flow=${f}`}>
                      Follow the data: {flows.find((x) => x.id === f)?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {e.moments.length > 0 && (
        <p className="mt-4 text-xs leading-relaxed text-paper-3">
          Scope labels ({Object.values(SCOPES).map((s) => s.label.toLowerCase()).join(', ')}) are an editorial reading of the report, not measured prevalence.
        </p>
      )}

      <EntryActions entry={e} placed={placed} />
    </article>
  );
}

function DateNotes({ lines }: { lines: number[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-sm text-paper-2 hover:border-line-2 hover:text-paper"
      >
        <span>
          <span className="eyebrow mr-2 !text-paper-2">Date caveat</span>
          {quote('report', lines[0])?.text.split('. ')[0]}.
        </span>
        <span aria-hidden="true" className={clsx('ml-3 transition-transform duration-300', open && 'rotate-45')}>
          +
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-3 rounded-xl bg-ink-2 p-4">
          {lines.map((l) => (
            <div key={l}>
              <p className="text-[0.875rem] leading-relaxed text-paper-2">{quote('report', l)?.text}</p>
              <SourceRef line={l} className="mt-1" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EntryActions({ entry: e, placed }: { entry: Entry; placed: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/atlas/${e.id}/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this link', url);
    }
  };
  const cls = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[0.8125rem] text-paper-2 transition-colors hover:border-line-3 hover:text-paper';
  return (
    <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
      <button type="button" onClick={copy} className={cls} aria-live="polite">
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      {placed && (
        <Link href={`/timeline/?focus=${e.id}`} className={cls}>
          See on timeline
        </Link>
      )}
      <Link href={`/connections/?node=${e.id}`} className={cls}>
        See connections
      </Link>
      <Link href={`/atlas/?cat=${e.category}`} className={cls}>
        More in {CATEGORIES[e.category].short}
      </Link>
    </div>
  );
}
