# Architecture

## Layers
- `src/content` – typed, source-linked research content (investigations, oddities, belief checks, arena, silence, people, places, archaeology, manuscripts, civilisations, objects, timeline, journeys, sources). `index.ts` provides lookup, link graph, search, daily picks and integrity checks.
- `src/app/[kind]` – one dynamic template renders every content kind (`/investigations/...`, `/oddity-vault/...`). Managed Oddity entries from the CMS merge in at request time (ISR 120 s).
- `src/server` – Postgres access (`db.ts`, auto-schema), auth (scrypt, sessions, roles, rate limit), settings, CMS merge, Bible data loader.
- `src/app/api` – JSON routes. Every privileged route calls `requireRole` on the server; UI hiding is never the control.
- `src/lib/journey.tsx` – client state (localStorage) mirrored to `/api/sync` when signed in.

## Data model (Postgres)
users, sessions, user_state, settings, cms_entries, cms_revisions, questions, question_votes, reports, audit, events (anonymous daily counters).

## Security
- scrypt password hashes with per-user salt; httpOnly, sameSite=lax, secure cookies; opaque session tokens stored hashed.
- Admin bootstrap by one-time `SETUP_TOKEN` (timing-safe compare); only works while no admin exists; password chosen by the person.
- In-memory rate limits on login, register, setup, questions, votes, reports, AI (per instance; use an edge limiter at scale).
- zod validation on every body; generic 500s; no secrets in client bundles; `.env*` ignored by git.
- Premium content is enforced server-side in `[kind]/[slug]/page.tsx`.

## Editorial workflow
draft → pending-review → published/scheduled (admin). Publishing requires sources (that exist), evidence and uncertainty. Every save writes a revision and an audit entry.

## AI
`/api/ai` retrieves entries via `search()` and Scripture via `resolveRef`/`concordance`, then either returns a research brief (no model) or, with `ANTHROPIC_API_KEY`, asks Claude to summarise only the retrieved context with numbered citations.

## Known limitations
See `docs/ROADMAP.md`.
