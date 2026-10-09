import type { Entry, Kind } from "./types";
import { INVESTIGATIONS } from "./investigations";
import { ODDITIES } from "./oddities";
import { ARENA, BELIEFS, SILENCES } from "./debates";
import { CIVILISATIONS, DIGS, MANUSCRIPTS, OBJECTS, PEOPLE, PLACES } from "./entities";
import { SOURCES, source } from "./sources";

export * from "./types";
export { SOURCES, source };
export { TIMELINE, JOURNEYS } from "./timeline";

export const KIND_META: Record<Kind, { label: string; plural: string; blurb: string; verb: string; group: "investigate" | "evidence" | "world" }> = {
  investigations: { label: "Investigation", plural: "Bible Detective", blurb: "Structured case files: question, evidence, competing explanations, and what remains unknown.", verb: "Enter the investigation", group: "investigate" },
  "oddity-vault": { label: "Oddity", plural: "Oddity Vault", blurb: "Curious questions about daily life in the biblical world, each with sources and stated uncertainty.", verb: "Open the vault entry", group: "investigate" },
  "belief-check": { label: "Belief check", plural: "Popular Belief Check", blurb: "Did the Bible actually say that? Each claim is sorted into what the text states, implies, or does not establish.", verb: "Check the claim", group: "investigate" },
  interpretations: { label: "Interpretation", plural: "Interpretation Arena", blurb: "Competing readings and textual differences side by side, with support and objections.", verb: "Compare interpretations", group: "investigate" },
  silence: { label: "Silence", plural: "Silence Explorer", blurb: "What the text says, implies, what later tradition adds, and what remains unknown.", verb: "Explore the silence", group: "investigate" },
  archaeology: { label: "Discovery", plural: "Archaeology Explorer", blurb: "What was found, how it was dated, what is inferred, and how direct the biblical link really is.", verb: "Examine the evidence", group: "evidence" },
  manuscripts: { label: "Manuscript", plural: "Manuscripts", blurb: "Scrolls, codices, and papyri: composition date versus the date of the surviving copy.", verb: "Open the manuscript", group: "evidence" },
  objects: { label: "Object", plural: "Object Detective", blurb: "What is this? Guess first, then reveal function, material, period, and evidence.", verb: "What is this?", group: "evidence" },
  people: { label: "Person", plural: "People", blurb: "Figures of the biblical world and what is known of them outside the Bible.", verb: "Meet the person", group: "world" },
  places: { label: "Place", plural: "Places", blurb: "Cities, sites, and regions, with notes on how securely each is located.", verb: "Visit the place", group: "world" },
  "ancient-world": { label: "Civilisation", plural: "Ancient World", blurb: "The empires and peoples around the Bible, and what the direct evidence of contact is.", verb: "Explore the civilisation", group: "world" },
};

export const KINDS = Object.keys(KIND_META) as Kind[];

export const ALL: Entry[] = [
  ...INVESTIGATIONS, ...ODDITIES, ...BELIEFS, ...ARENA, ...SILENCES,
  ...DIGS, ...MANUSCRIPTS, ...OBJECTS, ...PEOPLE, ...PLACES, ...CIVILISATIONS,
];

const map = new Map<string, Entry>(ALL.map((e) => [`${e.kind}/${e.slug}`, e]));

export const key = (e: Pick<Entry, "kind" | "slug">) => `${e.kind}/${e.slug}`;
export const href = (k: string) => `/${k}`;
export const get = (k: string) => map.get(k);
export const byKind = <T extends Entry>(kind: Kind) => ALL.filter((e) => e.kind === kind) as T[];
export const find = <T extends Entry>(kind: Kind, slug: string) => map.get(`${kind}/${slug}`) as T | undefined;

/** Outgoing links plus the reverse direction, de-duplicated. Only links that resolve are kept. */
export function neighbours(k: string): Entry[] {
  const seen = new Set<string>();
  const out: Entry[] = [];
  const add = (e: Entry | undefined) => { if (e && key(e) !== k && !seen.has(key(e))) { seen.add(key(e)); out.push(e); } };
  const self = map.get(k);
  self?.links.forEach((l) => add(map.get(l)));
  for (const e of ALL) if (e.links.includes(k)) add(e);
  return out;
}

export function graph(center: string, depth = 2) {
  const nodes = new Map<string, { id: string; title: string; kind: Kind; ring: number }>();
  const edges: { a: string; b: string }[] = [];
  const e0 = map.get(center);
  if (!e0) return { nodes: [], edges: [] };
  nodes.set(center, { id: center, title: e0.title, kind: e0.kind, ring: 0 });
  let frontier = [center];
  for (let r = 1; r <= depth; r++) {
    const next: string[] = [];
    for (const k of frontier) {
      for (const n of neighbours(k)) {
        const nk = key(n);
        if (!nodes.has(nk)) { nodes.set(nk, { id: nk, title: n.title, kind: n.kind, ring: r }); next.push(nk); }
        if (!edges.some((e) => (e.a === k && e.b === nk) || (e.a === nk && e.b === k))) edges.push({ a: k, b: nk });
      }
    }
    frontier = next;
  }
  return { nodes: [...nodes.values()], edges };
}

/** A deterministic daily pick (same for all visitors) from entries that make good discoveries. */
export function daily(date = new Date()) {
  const pool = ALL.filter((e) => e.kind === "oddity-vault" || e.kind === "belief-check" || e.kind === "archaeology" || e.kind === "objects");
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return pool[day % pool.length];
}
export function mysteryOfWeek(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / (86_400_000 * 7));
  return INVESTIGATIONS[day % INVESTIGATIONS.length];
}

export interface SearchDoc { k: string; kind: Kind; title: string; summary: string; tags: string[] }
export const searchDocs = (): SearchDoc[] => ALL.map((e) => ({ k: key(e), kind: e.kind, title: e.title, summary: e.summary, tags: e.tags }));

const STOP = new Set("the and for are was were what why who how when where did does do you your with from that this these those have has had not but can could would should about into than then them they their there which while will its it is in of to a an on at by or as be me my we our us i".split(" "));
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export function search(q: string, kinds?: Kind[], limit = 40) {
  const terms = norm(q).split(/[^a-z0-9']+/).filter((t) => t.length > 1 && !STOP.has(t));
  if (!terms.length) return [];
  const scored: { e: Entry; score: number }[] = [];
  for (const e of ALL) {
    if (kinds?.length && !kinds.includes(e.kind)) continue;
    const t = norm(e.title), s = norm(e.summary), g = norm(e.tags.join(" "));
    const extra = norm(JSON.stringify(e, (kk, v) => (kk === "sources" || kk === "links" || kk === "art" ? undefined : v)));
    let score = 0;
    let all = true;
    for (const w of terms) {
      let hit = 0;
      if (t.includes(w)) hit += 6;
      if (g.includes(w)) hit += 4;
      if (s.includes(w)) hit += 3;
      if (hit === 0 && extra.includes(w) && new RegExp("\\b" + w.replace(/[^a-z0-9]/g, "")).test(extra)) hit += 1;
      if (!hit) { all = false; break; }
      score += hit;
    }
    if (all) scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.e);
}

export const stats = () => ({
  entries: ALL.length,
  sources: SOURCES.length,
  links: ALL.reduce((n, e) => n + e.links.length, 0),
});

/** Links that do not resolve; used by tests and the admin health page. */
export function brokenLinks() {
  const bad: string[] = [];
  for (const e of ALL) {
    for (const l of e.links) if (!map.has(l)) bad.push(`${key(e)} -> ${l}`);
    for (const s of e.sources) if (!source(s)) bad.push(`${key(e)} source ${s}`);
  }
  return bad;
}
