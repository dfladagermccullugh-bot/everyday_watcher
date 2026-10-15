import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, Shell, SourceRef } from '@/components/ui';
import { OneTrip, ReaderDiagram, RoadHistory } from '@/components/plates/Plates';

export const metadata: Metadata = {
  title: 'Plate Readers in Context',
  description: 'Automated license-plate recognition and Flock-style camera networks, set in the wider history of vehicle and location data collection.',
};

const CONSIDERATIONS = [
  {
    title: 'Privacy',
    supported: 'Plate reads retained across many readers can produce location histories, and a camera image can be joined to other identifiers.',
    lines: [39, 5],
    questions: ['How long are reads kept?', 'Who can search them, and for what purposes?', 'Are reads combined with other datasets?'],
  },
  {
    title: 'Security',
    supported: 'The supplied research does not assess how plate-reader data is secured. It does describe audit logs that record who acted, where, and when.',
    lines: [179],
    questions: ['Is every search logged and reviewable?', 'Who holds the data: an agency, a vendor, or both?', 'What happens if it is breached?'],
  },
  {
    title: 'Public safety',
    supported: 'The spreadsheet gives the purpose as identifying vehicles and recording plates with associated locations and times. The report notes that link analysis can model relationships among vehicles and other entities.',
    lines: [39, 343],
    questions: ['What outcomes does the deployment measure?', 'How are misreads caught before they are acted on?'],
  },
  {
    title: 'Oversight',
    supported: 'The report names statutes for some systems — FISA, CALEA, Section 702 — but no plate-reader-specific law. Inclusion in the inventory does not mean a use is improper.',
    lines: [15, 325],
    questions: ['Is there a published use policy?', 'Are audits public?', 'Can residents see where readers are placed?'],
  },
];

export default function PlatesPage() {
  return (
    <>
      <Shell className="pb-16 pt-[calc(var(--nav-h)+3.5rem)]">
        <PageIntro eyebrow="Focus · Automated license-plate recognition" title="The plate reader, in context.">
          <p>
            Automated plate readers can attract public concern. In the spreadsheet, plate recognition appears in five forms among 326 systems.
            This section explains what the research says about them, places them beside related systems, and shows how much else can record the same
            trip.
          </p>
        </PageIntro>

        <aside className="mt-10 max-w-3xl rounded-2xl border border-dashed border-line-3 p-5 text-sm leading-relaxed text-paper-2">
          <p className="eyebrow !text-paper-2">A note on Flock Safety</p>
          <p className="mt-2">
            Flock Safety, named in this project’s brief, is a commercial vendor of plate-reader cameras. The research names no vendors. The updated
            spreadsheet does list <em>fixed neighborhood ALPR networks</em> (2017) and <em>mobile municipal ALPR scanning fleets</em> (2009) as their
            own systems. Nothing on this page describes Flock’s products, data practices, or contracts.
          </p>
        </aside>
      </Shell>

      <section className="border-t border-line">
        <Shell className="grid gap-10 py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">01 · What it does</p>
            <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.04]">An image becomes a record. Records become a route.</h2>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-paper-2">
              Automatic number-plate or license-plate recognition converts an image of a plate into searchable structured data. The report separates
              early ANPR research and trials from the later large-scale model that retains plate, place, and time records across many readers.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ReaderDiagram />
          </div>
        </Shell>
      </section>

      <section className="border-t border-line">
        <Shell className="py-20">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">02 · Where it sits in history</p>
              <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.04]">Older than it looks, and not alone on the road.</h2>
            </div>
            <div className="text-[0.9375rem] leading-relaxed text-paper-2 lg:col-span-6 lg:col-start-7">
              <p>
                The spreadsheet dates ANPR/ALPR to 1979, mobile municipal scanning fleets to 2009, and fixed neighborhood networks to 2017. The report
                cautions that the date depends on what counts as implementation: early recognition research and police trials preceded today’s
                networked databases by decades. Several roadside systems are older still. These systems are related, not identical.
              </p>
              <SourceRef line={434} className="mt-2" />
            </div>
          </div>
          <div className="mt-10">
            <RoadHistory />
          </div>
        </Shell>
      </section>

      <section className="border-t border-line">
        <Shell className="py-20">
          <p className="eyebrow">03 · One trip, many records</p>
          <h2 className="mt-4 max-w-3xl font-serif text-[2.4rem] leading-[1.04]">The camera on the pole is the part you can see.</h2>
          <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-paper-2">
            A plate reader is visible infrastructure: a camera on a pole. Many other systems in the research can record the same drive from inside the
            vehicle or the phone, or further downstream, where no one sees them.
          </p>
          <div className="mt-10">
            <OneTrip />
          </div>
        </Shell>
      </section>

      <section className="border-t border-line bg-ink-2">
        <Shell className="py-20">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">04 · Why it draws attention</p>
              <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.04]">What changes when plates become data.</h2>
            </div>
            <ol className="space-y-5 lg:col-span-6 lg:col-start-7">
              {[
                ['It turns a picture into a searchable record.', 39],
                ['A network of readers can describe where a vehicle has been, not only whether it broke a rule.', 39],
                ['Records are retained and pooled across many readers rather than kept at one camera.', 434],
                ['The same image can be joined to other identifiers: a face, a phone, a payment.', 5],
              ].map(([t, l], i) => (
                <li key={i} className="flex gap-4 border-b border-line pb-5">
                  <span className="font-mono text-sm text-paper-3">0{i + 1}</span>
                  <span>
                    <span className="block text-[1.0625rem] leading-snug text-paper">{t}</span>
                    <SourceRef line={l as number} className="mt-1.5" />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Shell>
      </section>

      <section className="border-t border-line">
        <Shell className="py-20">
          <p className="eyebrow">05 · Considerations</p>
          <h2 className="mt-4 max-w-3xl font-serif text-[2.4rem] leading-[1.04]">Four lenses, with the limits of the evidence marked.</h2>
          <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-paper-2">
            Each card separates what the supplied research supports from questions worth asking of any deployment. The questions are editorial; they are
            not claims about any system.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {CONSIDERATIONS.map((c) => (
              <article key={c.title} className="rounded-3xl border border-line p-6">
                <h3 className="font-serif text-[1.9rem] leading-none">{c.title}</h3>
                <p className="eyebrow mt-6">What the research supports</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-paper-2">{c.supported}</p>
                <div className="mt-2 flex flex-wrap gap-x-4">
                  {c.lines.map((l) => (
                    <SourceRef key={l} line={l} />
                  ))}
                </div>
                <p className="eyebrow mt-6">Questions to ask</p>
                <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-paper">
                  {c.questions.map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="text-paper-3">—</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-paper-2">
            Next:{' '}
            <Link href="/follow/?flow=plate" className="text-paper underline decoration-line-3 underline-offset-4">
              follow a plate read from collection to use
            </Link>{' '}
            or{' '}
            <Link href="/connections/?node=anpr-alpr" className="text-paper underline decoration-line-3 underline-offset-4">
              see what ALPR connects to
            </Link>
            .
          </p>
        </Shell>
      </section>
    </>
  );
}
