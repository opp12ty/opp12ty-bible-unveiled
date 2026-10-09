import Link from "next/link";
import { notFound } from "next/navigation";
import { bookBySlug } from "@/core/bible";
import { chapterCount } from "@/server/bible";
import { Crumbs } from "@/components/ui";

export default async function BookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;
  const b = bookBySlug(book);
  if (!b) notFound();
  const n = chapterCount(b.i);
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/bible", label: "Scripture" }, { label: b.name }]} />
      <h1 className="m-0 text-4xl">{b.name}</h1>
      <p className="muted">{b.group} · {n} chapter{n > 1 ? "s" : ""}</p>
      <div className="grid gap-2 grid-cols-5 sm:grid-cols-8 lg:grid-cols-12 mt-4">
        {Array.from({ length: n }, (_, i) => i + 1).map((c) => (
          <Link key={c} href={`/bible/${b.slug}/${c}`} className="card card-hover no-underline text-center py-3" style={{ color: "var(--text)", minHeight: 48 }}>{c}</Link>
        ))}
      </div>
    </div>
  );
}
