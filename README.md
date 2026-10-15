# The Invisible Infrastructure

An interactive atlas of fifty years of surveillance and data collection, built from two supplied research files.

```
npm install
npm run dev      # builds the dataset, then starts Next.js
npm run build    # builds the dataset and a fully static site in out/
npm start        # serves out/
```

## Sections

| Route | What it does |
|---|---|
| `/` | Discover: sensor field of all 292 systems, then a pinned scroll story through an ordinary day (GSAP, desktop) or stacked moments (mobile / reduced motion) |
| `/timeline/` | D3 timeline: zoom/pan, decade jumps, category highlight, density clusters, play-through, year inspector; vertical list on mobile |
| `/atlas/` | Fuzzy search (Fuse.js), faceted filters with live counts, sort; `/atlas/<id>/` static page per entry |
| `/connections/` | Sigma.js network of systems and linking keys with a text explorer (explorer only on mobile) |
| `/follow/` | Nine collect → link → derive → use journeys |
| `/plates/` | ALPR in context |
| `/sources/` | Method, data status, limits, citations; `/sources/report/` and `/sources/dataset/` reproduce the inputs with linkable line numbers |

All exploration state is in the URL (`?q=`, `?cat=`, `?entry=`, `?node=`, `?flow=`, `?focus=`, `?year=`), so Back/Forward and shared links work.

## Data

- `research/` — the supplied report and dataset notes, unmodified. Sources of truth.
- `scripts/build-data.mjs` — parses both files, validates every row and line reference, computes the graph layout, and writes `src/data/generated/*.json`. Fails the build on any broken reference.
- `scripts/enrichment.mjs` — internal fields (category, signal, operator), CSV year values the research describes, and dated milestones, each with a source line.
- `scripts/relations.mjs` — relationships, each `documented` or `illustrative`, with a report line.
- `scripts/stories.mjs` — the ordinary day, Follow the Data journeys, and the plate-reader trip.

**The original CSV was not among the supplied files.** The dataset notes list all 292 rows but give purpose and year for only 20. Other purposes paraphrase the mapped report paragraph and are flagged in the UI; no year is invented. To use the original, save it as `data/surveillance_media.csv` (three columns: medium, purpose, year) and rebuild — its values replace the reconstructed ones, matched by medium name. `data/surveillance_media.reconstructed.csv` is regenerated on each build.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · Motion · GSAP ScrollTrigger (Discover only, lazy) · D3 · Sigma.js + Graphology (lazy, wide screens) · Zustand · Fuse.js.

No analytics, cookies, or runtime third-party requests; fonts are self-hosted by `next/font`.
