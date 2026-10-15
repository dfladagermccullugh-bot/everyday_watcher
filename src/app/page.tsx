import Link from 'next/link';
import { SensorField } from '@/components/discover/SensorField';
import { DayJourney } from '@/components/discover/DayJourney';
import { Linkage } from '@/components/discover/Linkage';
import { entries, meta, timelineContext, flows } from '@/lib/data';

export default function Discover() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_10%,transparent_65%)]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[100svh] max-w-[1440px] items-center gap-8 px-4 pb-16 pt-[calc(var(--nav-h)+2.5rem)] sm:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-6">
            <p className="eyebrow animate-rise">An interactive atlas · {entries.length} documented systems</p>
            <h1 className="mt-5 font-serif text-display text-balance animate-rise [animation-delay:80ms]">
              The Invisible <span className="italic text-paper-2">Infrastructure</span>
            </h1>
            <p className="mt-6 font-serif text-[1.65rem] leading-snug text-paper-2 animate-rise [animation-delay:160ms]">
              Fifty years of watching, measuring, and knowing.
            </p>
            <p className="mt-8 max-w-xl text-[1.125rem] leading-relaxed text-paper text-pretty animate-rise [animation-delay:240ms]">
              How much of your everyday life is observed, recorded, analyzed, inferred, or stored — and how did we get here?
            </p>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-paper-2 text-pretty animate-rise [animation-delay:300ms]">
              Surveillance is not one technology. It is a connected ecosystem of cameras, radios, logs, payments, sensors, and the software
              that links them. Each point in the field is one documented system.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-rise [animation-delay:360ms]">
              <a href="#day" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-paper px-6 text-[0.9375rem] font-medium text-ink transition-transform hover:scale-[1.02] active:scale-[0.99]">
                Begin an ordinary day <span aria-hidden="true">↓</span>
              </a>
              <Link href="/atlas/" className="inline-flex min-h-12 items-center rounded-full border border-line-3 px-6 text-[0.9375rem] text-paper hover:border-paper">
                Browse all {entries.length}
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[560px] lg:col-span-6 lg:max-w-none">
            <SensorField />
          </div>
        </div>
      </section>

      <DayJourney />

      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-10">
          <h2 className="font-serif text-title text-balance lg:col-span-5">No single system sees the whole day. Linked together, they can describe it.</h2>
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-paper-2 lg:col-span-6 lg:col-start-7">
            <p>
              The report traces a shift from separate records and local sensors to networked, persistent, linkable data. A camera image can be
              joined to a face template, a plate, a phone identifier, a payment, a transit tap, or an advertising identifier.
            </p>
            <p>
              Surveillance also does not require a camera or a microphone. A smart meter, a vehicle’s crash recorder, a Wi‑Fi radio, a browser’s
              configuration, or a cloud audit log can each establish identity, behavior, location, or chronology.
            </p>
            <p className="text-sm">
              <Link className="text-paper underline decoration-line-3 underline-offset-4" href="/sources/report/#L5">
                Report, executive summary ¶ lines 5–9
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Linkage />

      <section aria-labelledby="explore-title" className="mx-auto max-w-[1440px] px-4 pb-28 sm:px-6 lg:px-10">
        <p className="eyebrow">Part three · Keep exploring</p>
        <h2 id="explore-title" className="mt-4 font-serif text-title">
          Five ways into the same research.
        </h2>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/timeline/', title: 'Timeline', text: `${entries.length} systems from ${meta.yearRange[0]} to ${meta.yearRange[1]}, plus ${timelineContext.context.length} laws and oversight events.`, n: '01' },
            { href: '/atlas/', title: 'Atlas', text: `All ${entries.length} systems, searchable and filterable, each traced to the paragraph it comes from.`, n: '02' },
            { href: '/connections/', title: 'Connections', text: `${meta.counts.relationsDocumented} documented relationships and the identifiers that join records.`, n: '03' },
            { href: '/follow/', title: 'Follow the Data', text: `${flows.length} journeys from raw collection to linking, inference, and use.`, n: '04' },
            { href: '/plates/', title: 'Plate Readers', text: 'Automated license-plate recognition, set beside everything else that can record a car trip.', n: '05' },
            { href: '/sources/', title: 'Sources & method', text: 'How the data was compiled, what is missing, and the full report with numbered lines.', n: '06' },
          ].map((c) => (
            <li key={c.href} className="bg-ink">
              <Link href={c.href} className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors hover:bg-ink-2">
                <span className="font-mono text-xs text-paper-3">{c.n}</span>
                <span>
                  <span className="flex items-center justify-between font-serif text-[2rem] leading-none">
                    {c.title}
                    <span aria-hidden="true" className="translate-x-0 text-paper-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-paper">
                      →
                    </span>
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-paper-2">{c.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
