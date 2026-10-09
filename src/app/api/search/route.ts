import { NextResponse } from "next/server";
import { search, key, KIND_META } from "@/content";
import { concordance, resolveRef, searchStrongs } from "@/server/bible";
import { BOOKS } from "@/core/bible";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 2) return NextResponse.json({ content: [], verses: [], reference: null, lexicon: [] });

  const content = search(q, undefined, 30).map((e) => ({
    k: key(e), href: "/" + key(e), kind: e.kind, kindLabel: KIND_META[e.kind].label, title: e.title, summary: e.summary,
  }));

  const ref = resolveRef(q);
  const reference = ref ? { label: ref.label, href: ref.href, verses: ref.verses.slice(0, 6) } : null;

  let verses: { ref: string; href: string; text: string }[] = [];
  let total = 0;
  if (!ref && q.length >= 3) {
    const c = concordance("kjv", q, { limit: 8 });
    total = c.total;
    verses = c.items.map((v) => ({ ref: `${BOOKS[v.b].name} ${v.c}:${v.v}`, href: `/bible/${BOOKS[v.b].slug}/${v.c}#v${v.v}`, text: v.text }));
  }
  const lexicon = q.length >= 3 ? searchStrongs(q, 6).map((e) => ({ id: e.id, lemma: e.l, translit: e.x, gloss: e.s || e.k })) : [];
  return NextResponse.json({ content, reference, verses, total, lexicon }, { headers: { "cache-control": "no-store" } });
}
