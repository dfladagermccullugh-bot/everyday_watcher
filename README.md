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
| `/` | Discover: sensor field of all 326 systems, then a pinned scroll story through an ordinary day (GSAP, desktop) or stacked moments (mobile / reduced motion) |
| `/timeline/` | D3 timeline of all systems (1858–2024, early years compressed): semantic zoom, decade jumps, category highlight, density clusters, play-through, year inspector; vertical list on mobile |
| `/atlas/` | Fuzzy search (Fuse.js), faceted filters with live counts, sort; `/atlas/<id>/` static page per entry |
| `/connections/` | Sigma.js network of systems and linking keys with a text explorer (explorer only on mobile) |
| `/follow/` | Nine collect → link → derive → use journeys |
| `/plates/` | ALPR in context |
| `/sources/` | Method, data status, limits, citations; `/sources/spreadsheet/`, `/sources/report/` and `/sources/dataset/` reproduce the inputs with linkable rows and lines |

All exploration state is in the URL (`?q=`, `?cat=`, `?entry=`, `?node=`, `?flow=`, `?focus=`, `?year=`), so Back/Forward and shared links work.

## Data

- `research/surveillance_media.xlsx` — **source of truth**: one row per system with its medium, purpose, and year (326 rows). The build reads it directly; edit it and rebuild.
- `research/deep-research-report.md` — the research report: explanations, citations, dated milestones, relationships. 292 of the spreadsheet rows match its inventory by name.
- `research/dataset-reconstruction.md` — maps each of those 292 rows to its report paragraph, plus date caveats. Its approximate dates are superseded by the spreadsheet.
- `scripts/build-data.mjs` — reads the spreadsheet, links rows to the report, validates every row, line, and reference, computes the graph layout, and writes `src/data/generated/*.json` and `data/surveillance_media.csv`. It fails the build on a broken reference, and on any spreadsheet row with no enrichment.
- `scripts/enrichment.mjs` — internal fields (category, signal, operator) for report rows (`ROWS`) and spreadsheet-only rows (`NEW_ROWS`), how the report itself dates rows, and the report's dated milestones.
- `scripts/relations.mjs` — relationships, each `documented` (with a report line) or `illustrative`.
- `scripts/stories.mjs` — the ordinary day, Follow the Data journeys, and the plate-reader trip.

**Adding a row:** add it to the spreadsheet, then add `[name, category, signal, actor]` to `NEW_ROWS`. The build tells you if you forget.

Where the report dates a system differently from the spreadsheet (currently drone surveillance and AFIS), the spreadsheet year is used and the report's dating is shown beside it.

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · Motion · GSAP ScrollTrigger (Discover only, lazy) · D3 · Sigma.js + Graphology (lazy, wide screens) · Zustand · Fuse.js.

No analytics, cookies, or runtime third-party requests; fonts are self-hosted by `next/font`.
