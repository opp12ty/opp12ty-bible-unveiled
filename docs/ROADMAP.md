# Roadmap and known limitations

## Delivered in release 1
Foundation, design system, content model, Bible Detective, Oddity Vault, Belief Check, Arena, Silence Explorer, Evidence Lab, map, timeline, graph, Scripture + lexicon, search, AI brief, accounts, sync, community questions, reports, admin CMS/settings/moderation/audit/health, PWA.

## Staged (not built; do not claim)
1. **Payments** – provider integration (webhook-verified), receipts, renewals, promo codes. Entitlements and plan fields exist; admins can grant plans manually.
2. **Institutions** – class groups, assignments, progress reports.
3. **Languages** – UI is LTR/English only; i18n framework and reviewed translations pending.
4. **Visuals** – artwork is generated schematic art. Licensed photography, digital reconstructions and 3D city/house explorers are pending licensing and production.
5. **Audio** – ancient sound world, narration, captions.
6. **Simulations** – Ancient Life, Live Like the Ancients, Alternate History Lab.
7. **Page-level citations and peer review** – sources are cited at work level; each entry should get specialist review before wide promotion.
8. **Community** – discussion threads, follows, expert profiles (questions board only today).
9. **Notifications** – email and push.
10. **Observability** – external error tracking and alerting.
11. **Rate limiting** – move to a shared store (Redis/edge) for multi-instance accuracy.

## Content growth
Add entries in `src/content/*.ts`; `npm test` verifies links and sources. Prefer fewer, deeper, reviewed entries over shallow volume.
