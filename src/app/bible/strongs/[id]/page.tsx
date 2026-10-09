import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKS } from "@/core/bible";
import { strongsEntry, strongsUsage, unpack, verseText } from "@/server/bible";
import { Crumbs } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = strongsEntry(id);
  return e ? { title: `${id.toUpperCase()} ${e.l} (${e.x})`, description: e.s || e.k } : {};
}

export default async function StrongsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = raw.toUpperCase();
  const e = /^[HG]\d{1,4}$/.test(id) ? strongsEntry(id) : null;
  if (!e) notFound();
  const { refs, words } = strongsUsage(id);
  const sample = refs.slice(0, 15).map((n) => {
    const [b, c, v] = unpack(n);
    return { label: `${BOOKS[b].name} ${c}:${v}`, href: `/bible/${BOOKS[b].slug}/${c}#v${v}`, text: verseText("kjv", { book: b, chapter: c, v }) };
  });
  const hebrew = id.startsWith("H");
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/bible", label: "Scripture" }, { href: "/bible/strongs", label: "Original languages" }, { label: id }]} />
      <div className="card p-6">
        <div className="chip">{hebrew ? "Hebrew / Aramaic" : "Koine Greek"} · {id}</div>
        <h1 className="m-0 mt-2 text-5xl" lang={hebrew ? "he" : "el"} dir={hebrew ? "rtl" : "ltr"}>{e.l}</h1>
        <p className="m-0 mt-1 muted text-lg">{e.x}{e.p ? ` · pronounced ${e.p}` : ""}</p>
        <dl className="grid gap-3 sm:grid-cols-2 mt-4 mb-0">
          {e.s && <div><dt className="text-xs uppercase tracking-widest muted">Short definition</dt><dd className="m-0">{e.s}</dd></div>}
          {e.d && <div><dt className="text-xs uppercase tracking-widest muted">Derivation</dt><dd className="m-0">{e.d}</dd></div>}
          {e.k && <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-widest muted">Rendered in the KJV as</dt><dd className="m-0">{e.k}</dd></div>}
        </dl>
      </div>
      <div className="card p-4 mt-4" style={{ borderColor: "rgba(243,171,60,.5)" }}>
        <b>Read with care.</b> A dictionary lists the range of meanings a word can carry. Which meaning applies in a given verse is decided by context, not by the list. This entry is from Strong&apos;s dictionary (1890); check a modern lexicon for specialist work.
      </div>
      <h2 className="text-2xl mt-8 mb-2">How the KJV renders it ({refs.length} verses)</h2>
      <div className="flex flex-wrap gap-2">{words.map(([w, n]) => <span key={w} className="chip">{w} · {n}</span>)}</div>
      <h2 className="text-2xl mt-8 mb-2">Occurrences</h2>
      <ul className="list-none p-0 m-0 grid gap-2">
        {sample.map((s) => <li key={s.href} className="card p-3"><Link href={s.href} className="font-semibold">{s.label}</Link><p className="m-0 mt-1 text-sm">{s.text}</p></li>)}
      </ul>
      {refs.length > sample.length && <p className="muted text-sm mt-3">Showing {sample.length} of {refs.length}. Use <Link href={`/bible/search?q=${encodeURIComponent(words[0]?.[0] ?? "")}`}>concordance search</Link> for more.</p>}
    </div>
  );
}
