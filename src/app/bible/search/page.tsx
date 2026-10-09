import type { Metadata } from "next";
import Link from "next/link";
import { BOOKS } from "@/core/bible";
import { concordance } from "@/server/bible";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Search Scripture", description: "Concordance search across the KJV, BSB and ASV with phrase and wildcard support." };

export default async function BibleSearch({ searchParams }: { searchParams: Promise<{ q?: string; t?: string; b?: string; o?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const t = sp.t === "bsb" || sp.t === "asv" ? sp.t : "kjv";
  const offset = Math.max(0, Number(sp.o) || 0);
  const book = sp.b !== undefined && sp.b !== "" ? Number(sp.b) : undefined;
  const res = q.length >= 3 ? concordance(t, q, { book: Number.isInteger(book) ? book : undefined, offset, limit: 40 }) : null;
  const href = (o: number) => `/bible/search?q=${encodeURIComponent(q)}&t=${t}${book !== undefined ? `&b=${book}` : ""}&o=${o}`;
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/bible", label: "Scripture" }, { label: "Search" }]} />
      <h1 className="m-0 text-4xl">Search Scripture</h1>
      <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end my-5">
        <div><label htmlFor="q">Words or &quot;exact phrase&quot; (use * for any ending)</label><input id="q" name="q" type="search" defaultValue={q} placeholder='e.g. shepherd, "house of David", love*' /></div>
        <div><label htmlFor="t">Version</label><select id="t" name="t" defaultValue={t} style={{ width: "auto" }}><option value="kjv">KJV</option><option value="bsb">BSB</option><option value="asv">ASV</option></select></div>
        <button className="neon neon-blue" type="submit">Search</button>
      </form>
      {q && q.length < 3 && <p className="muted">Type at least three letters.</p>}
      {res && res.total === 0 && <div className="card p-5"><p className="m-0">No verses match “{q}”. Try fewer words, a different spelling, or a wildcard such as <code>{q.slice(0, 4)}*</code>.</p></div>}
      {res && res.total > 0 && (
        <>
          <p className="muted" role="status">{res.total} verse{res.total > 1 ? "s" : ""} · {res.words} occurrence{res.words > 1 ? "s" : ""}</p>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {res.byBook.sort((a, b) => a.book - b.book).slice(0, 30).map((x) => <Link key={x.book} href={`/bible/search?q=${encodeURIComponent(q)}&t=${t}&b=${x.book}`} className="chip no-underline">{BOOKS[x.book].abbr} {x.n}</Link>)}
            {book !== undefined && <Link href={`/bible/search?q=${encodeURIComponent(q)}&t=${t}`} className="chip no-underline" style={{ color: "var(--gold-soft)" }}>Clear book filter</Link>}
          </div>
          <ul className="list-none p-0 m-0 grid gap-2">
            {res.items.map((v) => (
              <li key={`${v.b}-${v.c}-${v.v}`} className="card p-3">
                <Link href={`/bible/${BOOKS[v.b].slug}/${v.c}#v${v.v}`} className="font-semibold">{BOOKS[v.b].name} {v.c}:{v.v}</Link>
                <p className="m-0 mt-1">{v.text}</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-5">
            {offset > 0 ? <Link className="neon neon-ghost neon-sm no-underline" href={href(Math.max(0, offset - 40))}>← Previous</Link> : <span />}
            {offset + 40 < (book !== undefined ? res.byBook.find((x) => x.book === book)?.n ?? 0 : res.total) && <Link className="neon neon-ghost neon-sm no-underline" href={href(offset + 40)}>Next →</Link>}
          </div>
        </>
      )}
    </div>
  );
}
