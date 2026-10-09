import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKS, TRANSLATIONS, bookBySlug, hasText, isTranslation, type TranslationId } from "@/core/bible";
import { chapterCount, chapterVerses, entriesForChapter, parseTagged } from "@/server/bible";
import { EntryCard, Crumbs } from "@/components/ui";
import { VerseList } from "@/components/VerseList";
import { key } from "@/content";

type P = { params: Promise<{ book: string; chapter: string }>; searchParams: Promise<{ t?: string; v?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { book, chapter } = await params;
  const b = bookBySlug(book);
  return b ? { title: `${b.name} ${chapter}`, description: `Read ${b.name} ${chapter} with Strong's numbers and links to investigations.` } : {};
}

export default async function ChapterPage({ params, searchParams }: P) {
  const { book, chapter } = await params;
  const sp = await searchParams;
  const b = bookBySlug(book);
  const c = Number(chapter);
  if (!b || !Number.isInteger(c) || c < 1 || c > chapterCount(b.i)) notFound();
  let t: TranslationId = isTranslation(sp.t) ? sp.t : "kjv";
  if (!hasText(t, b.i)) t = "kjv";
  const compare = sp.v && isTranslation(sp.v) && hasText(sp.v, b.i) && sp.v !== t ? (sp.v as TranslationId) : null;

  const verses = chapterVerses(t, b.i, c);
  const other = compare ? chapterVerses(compare, b.i, c) : [];
  const items = verses.map((txt, i) => ({
    n: i + 1,
    words: t === "kjv" ? parseTagged(txt) : null,
    text: t === "kjv" ? "" : txt,
    other: compare ? other[i] ?? "" : "",
    otherRtl: compare === "wlc",
  }));
  const n = chapterCount(b.i);
  const link = (cc: number) => `/bible/${b.slug}/${cc}${t !== "kjv" ? `?t=${t}` : ""}`;
  const related = entriesForChapter(b.i, c);
  const rtl = t === "wlc";

  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/bible", label: "Scripture" }, { href: `/bible/${b.slug}`, label: b.name }, { label: `Chapter ${c}` }]} />
      <h1 className="m-0 text-4xl">{b.name} {c}</h1>
      <form className="flex flex-wrap gap-2 items-end my-4" method="get">
        <div><label htmlFor="t">Version</label>
          <select id="t" name="t" defaultValue={t} style={{ width: "auto" }}>
            {TRANSLATIONS.filter((x) => hasText(x.id, b.i)).map((x) => <option key={x.id} value={x.id}>{x.name} — {x.full}</option>)}
          </select></div>
        <div><label htmlFor="v">Compare with</label>
          <select id="v" name="v" defaultValue={compare ?? ""} style={{ width: "auto" }}>
            <option value="">(none)</option>
            {TRANSLATIONS.filter((x) => hasText(x.id, b.i)).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select></div>
        <button className="neon neon-blue neon-sm" type="submit">Apply</button>
      </form>

      <article className="parchment p-5 sm:p-8" dir={rtl ? "rtl" : "ltr"} lang={rtl ? "he" : t === "tr" ? "el" : "en"}>
        <VerseList slug={b.slug} chapter={c} items={items} rtl={rtl} compareLabel={compare ? TRANSLATIONS.find((x) => x.id === compare)!.name : undefined} />
      </article>

      <nav aria-label="Chapter navigation" className="flex justify-between mt-6">
        {c > 1 ? <Link className="neon neon-ghost no-underline" href={link(c - 1)}>← Chapter {c - 1}</Link> : <span />}
        {c < n ? <Link className="neon neon-ghost no-underline" href={link(c + 1)}>Chapter {c + 1} →</Link> : <span />}
      </nav>
      <p className="muted text-xs mt-4">{TRANSLATIONS.find((x) => x.id === t)!.full}. {TRANSLATIONS.find((x) => x.id === t)!.note}. Tap a highlighted word in the KJV to see the Hebrew or Greek behind it; tap a verse number to highlight it in My Journey.</p>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl m-0 mb-3">Investigations touching this chapter</h2>
          <div className="grid gap-3 sm:grid-cols-2">{related.map((e) => <EntryCard key={key(e)} e={e} compact />)}</div>
        </section>
      )}
      <p className="mt-6 text-sm muted">Next: <Link href={`/bible/search?q=${encodeURIComponent(b.name)}`}>search for “{b.name}”</Link> · {BOOKS.length} books available.</p>
    </div>
  );
}
