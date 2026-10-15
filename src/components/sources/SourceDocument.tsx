import fs from 'node:fs';
import path from 'node:path';
import { citationById } from '@/lib/data';

// The dataset notes use their own citation numbering, which overlaps the report's.
const DATASET_LABELS: Record<string, string> = {
  '9search3': 'NIST · FERET', '9search14': 'FBI · IAFIS and NGI', '11search0': 'FBI · CODIS', '11search3': 'FBI · NDIS',
  '9search1': 'AWS · CloudTrail', '9search0': 'USGS · Landsat', '12search0': 'IETF · RFC 2109', '12search2': 'Bluetooth SIG · BLE',
  '10search4': 'Apple · Apple Watch', '10search0': 'Apple · Apple Watch', '13search0': 'NHTSA · event data recorders', '14search2': 'FAA · civil UAV',
  '13search1': 'NHGRI · DTC genetic testing', '14search1': 'FTC · Vizio', '14search0': 'FTC · Nomi',
};

const CITE = /?cite((?:?turn\d+(?:search|view)\d+)+)?/g;

function inline(text: string, key: string, labels: (id: string) => string) {
  // Split out citation tokens and **bold** / `code` spans.
  const parts: React.ReactNode[] = [];
  let rest = text.replace(/?filecite?\w+?/g, ' [supplied report]');
  let i = 0;
  const re = new RegExp(`${CITE.source}|\\*\\*(.+?)\\*\\*|\`([^\`]+)\``, 'g');
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(rest))) {
    if (m.index > last) parts.push(rest.slice(last, m.index));
    if (m[1]) {
      const ids = m[1].replace(//g, '').split('turn').filter(Boolean);
      parts.push(
        <sup key={`${key}-${i++}`} className="ml-0.5 font-mono text-[0.625rem] text-paper-3">
          [{ids.map(labels).join('; ')}]
        </sup>,
      );
    } else if (m[2]) parts.push(<strong key={`${key}-${i++}`} className="font-semibold text-paper">{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={`${key}-${i++}`} className="rounded bg-ink-3 px-1 font-mono text-[0.8125rem]">{m[3]}</code>);
    last = m.index + m[0].length;
  }
  if (last < rest.length) parts.push(rest.slice(last));
  rest = '';
  return parts;
}

/** Renders a supplied research file line by line so any line can be linked to. */
export function SourceDocument({ file }: { file: 'research/deep-research-report.md' | 'research/dataset-reconstruction.md' }) {
  const lines = fs.readFileSync(path.join(process.cwd(), file), 'utf8').split('\n');
  const dataset = file.includes('dataset');
  const labels = (id: string) => (dataset ? DATASET_LABELS[id] : citationById.get(id)?.label) ?? id;
  let inFence = false;
  return (
    <ol className="font-[450]">
      {lines.map((raw, idx) => {
        const n = idx + 1;
        const fence = raw.startsWith('```');
        if (fence) inFence = !inFence;
        const code = inFence || fence;
        let cls = 'text-[0.9375rem] leading-relaxed text-paper-2';
        let body: React.ReactNode = inline(raw, String(n), labels);
        if (code) {
          cls = 'font-mono text-[0.8125rem] text-paper-3 whitespace-pre-wrap';
          body = raw;
        } else if (raw.startsWith('# ')) {
          cls = 'font-serif text-[2.4rem] leading-tight text-paper';
          body = raw.slice(2);
        } else if (raw.startsWith('## ')) {
          cls = 'font-serif text-[1.9rem] leading-tight text-paper pt-6';
          body = raw.slice(3);
        } else if (raw.startsWith('### ')) {
          cls = 'font-serif text-2xl text-paper pt-4';
          body = raw.slice(4);
        } else if (raw.startsWith('|')) {
          cls = 'font-mono text-[0.8125rem] text-paper-2 whitespace-pre-wrap';
          body = raw;
        } else if (raw.startsWith('- ')) {
          body = (
            <span className="flex gap-2">
              <span className="text-paper-3">•</span>
              <span>{inline(raw.slice(2), String(n), labels)}</span>
            </span>
          );
        }
        return (
          <li key={n} id={`L${n}`} className="group grid scroll-mt-28 grid-cols-[3.25rem_1fr] gap-3 rounded-lg px-2 py-0.5 target:bg-sig-visual/10 target:ring-1 target:ring-sig-visual/40 sm:grid-cols-[4rem_1fr]">
            <a href={`#L${n}`} className="select-none pt-[3px] text-right font-mono text-[0.6875rem] text-paper-3 tabular hover:text-paper" aria-label={`Line ${n}`}>
              {n}
            </a>
            <div className={raw.trim() ? cls : 'h-3'}>{raw.trim() ? body : null}</div>
          </li>
        );
      })}
    </ol>
  );
}
