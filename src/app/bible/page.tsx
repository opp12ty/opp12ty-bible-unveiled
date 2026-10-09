import type { Metadata } from "next";
import Link from "next/link";
import { BOOKS, TRANSLATIONS } from "@/core/bible";
import { chapterCount, verseOfTheDay } from "@/server/bible";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Scripture Reader", description: "Read the KJV with Strong's numbers, the Berean Standard Bible, ASV, Hebrew (WLC) and Greek (Textus Receptus), with links to investigations." };

export default function BibleHome() {
  const groups = [...new Set(BOOKS.map((b) => b.group))];
  const v = verseOfTheDay();
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Scripture" }]} />
      <h1 className="m-0 text-4xl">Scripture Reader</h1>
      <p className="muted max-w-2xl mt-2">Public-domain texts only: {TRANSLATIONS.map((t) => t.name).join(", ")}. Tap any English word in the KJV to see its Hebrew or Greek source word. Investigations that discuss a chapter are linked at its foot.</p>
      <div className="flex gap-2 flex-wrap my-4">
        <Link className="neon neon-blue neon-sm no-underline" href="/bible/search">Search Scripture</Link>
        <Link className="neon neon-violet neon-sm no-underline" href="/bible/strongs">Original-language lexicon</Link>
        <Link className="neon neon-gold neon-sm no-underline" href={`/bible/${BOOKS[v.book].slug}/${v.chapter}#v${v.v}`}>Verse of the day: {v.label}</Link>
      </div>
      {groups.map((g) => (
        <section key={g} className="mt-8">
          <h2 className="text-xl m-0 mb-3">{g}</h2>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {BOOKS.filter((b) => b.group === g).map((b) => (
              <Link key={b.slug} href={`/bible/${b.slug}`} className="card card-hover no-underline p-3" style={{ color: "var(--text)" }}>
                <b>{b.name}</b><span className="block muted text-xs">{chapterCount(b.i)} chapters</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
