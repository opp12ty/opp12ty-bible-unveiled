# BIBLE UNVEILED

An interactive Bible investigation platform: case files, an Oddity Vault, popular-belief checks, an interpretation arena, archaeology and manuscript explorers, an interactive map, timeline and knowledge graph, a Scripture reader with Hebrew/Greek lexicon, a source-grounded AI research assistant, and an editorial CMS.

> **You don't just read the Bible. You investigate it.**

## What is built

| Area | Status |
| --- | --- |
| Bible Detective (12 case files with depth slider, evidence board, viewpoints, quiz, notes) | Live |
| Oddity Vault (18), Popular Belief Check (12), Interpretation Arena (6), Silence Explorer (3) | Live |
| Archaeology (11), Manuscripts (10), Object Detective (8), People (18), Places (21), Civilisations (8) | Live |
| Interactive map (Leaflet), Timeline (29 events, 6 regions), Knowledge graph | Live |
| Scripture reader: KJV + Strong's, BSB, ASV, WLC Hebrew, TR Greek, concordance, lexicon | Live |
| Universal search (content + verses + lexicon), Wait… What?, Surprise Me, quizzes, journeys | Live |
| My Journey (XP, levels, badges, streaks, notes, export/reset) | Live (device) / synced with account |
| Unveiled AI | Research brief always; generated answers with `ANTHROPIC_API_KEY` |
| Accounts, sync, community questions, error reports, admin CMS workflow, settings, audit | Live with `DATABASE_URL` |
| PWA (manifest, offline fallback, service worker) | Live |
| Payments, classrooms, extra languages, 3D cities, ancient-sound library, simulations | Staged (see `docs/ROADMAP.md`) |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Leaflet · PostgreSQL via `pg` (optional) · Vitest.

Content is typed data in `src/content` (every entry lists `sources` and `links`; tests fail on any broken reference). The database is optional: the public site works without it; accounts, sync, community, and the admin CMS switch on when `DATABASE_URL` is set. The schema is created automatically on first use (`src/server/db.ts`).

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000, no database needed
```

With a local Postgres (embedded PGlite, no install):

```bash
node scripts/dev-db.mjs &
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/postgres SETUP_TOKEN=choose-a-long-random-token npm run dev
# then open /admin/setup and create your administrator with a password of your own choosing
```

## Environment variables

See `.env.example`. Secrets are never committed. `SETUP_TOKEN` only proves control of the deployment; the administrator chooses their own password.

## Test and build

```bash
npm test
npm run typecheck
npm run build
```

## Deploy (Vercel)

Import the repository; framework preset **Next.js**; add `DATABASE_URL` (Neon or any Postgres), `SETUP_TOKEN`, and optionally `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL`. Then visit `/admin/setup`. Bible text files in `data/bible` are bundled with the serverless functions via `outputFileTracingIncludes`.

## Editorial rules

- Do not fabricate sources, manuscripts, inscriptions, quotations or definitions.
- Every entry needs sources and a stated uncertainty; reconstructions are labelled.
- Confidence uses the five-word vocabulary on `/evidence-lab`; there are no truth percentages.

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.
