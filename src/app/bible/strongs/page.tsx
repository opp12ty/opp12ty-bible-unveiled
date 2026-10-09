import type { Metadata } from "next";
import Link from "next/link";
import { searchStrongs } from "@/server/bible";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Original-Language Lexicon", description: "Search Hebrew and Greek words by number, original script, transliteration or English gloss." };

export default async function StrongsHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const res = q ? searchStrongs(q, 40) : [];
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/bible", label: "Scripture" }, { label: "Original languages" }]} />
      <h1 className="m-0 text-4xl">Original-Language Explorer</h1>
      <p className="muted max-w-2xl">Search Hebrew (H) and Greek (G) words by Strong&apos;s number, script, transliteration, or English meaning. Entries come from Strong&apos;s dictionaries (1890): useful for orientation, but a word&apos;s dictionary range is not its meaning in a given verse.</p>
      <form method="get" className="flex gap-2 my-5"><label htmlFor="q" className="sr-only">Search</label><input id="q" name="q" type="search" defaultValue={q} placeholder="e.g. H7225, shalom, agape, ἀγάπη, ketos" /><button className="neon neon-violet" type="submit">Search</button></form>
      {q && res.length === 0 && <div className="card p-5">No entries matched. Try an English word, a number such as G26, or a transliteration.</div>}
      <ul className="list-none p-0 m-0 grid gap-2">
        {res.map((e) => (
          <li key={e.id}><Link href={`/bible/strongs/${e.id}`} className="card card-hover block no-underline p-3" style={{ color: "var(--text)" }}>
            <span className="chip mr-2">{e.id}</span><b className="serif text-lg">{e.l}</b> <span className="muted">{e.x}</span>
            <span className="block muted text-sm">{e.s || e.k}</span>
          </Link></li>
        ))}
      </ul>
    </div>
  );
}
