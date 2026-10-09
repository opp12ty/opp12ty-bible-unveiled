import type { Metadata } from "next";
import Link from "next/link";
import { ALL, SOURCES, key } from "@/content";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Source Library", description: "Every source cited on BIBLE UNVEILED and where it is used." };

const TYPE: Record<string, string> = {
  "biblical-text": "Biblical text", "scholarly-book": "Scholarly book", "academic-article": "Academic article", "manuscript-catalogue": "Manuscript catalogue",
  "museum-collection": "Museum collection", "archaeological-report": "Archaeological report", "ancient-text": "Ancient text", "reference-work": "Reference work",
  institutional: "Institutional resource", "digital-archive": "Digital archive",
};

export default function Sources() {
  const used = new Map<string, string[]>();
  for (const e of ALL) for (const s of e.sources) (used.get(s) ?? used.set(s, []).get(s)!).push(key(e));
  const sorted = [...SOURCES].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Sources" }]} />
      <h1 className="m-0 text-4xl">Source Library</h1>
      <p className="muted mt-2 mb-6">{SOURCES.length} works. Citations are made at the level of the work; editors add page-level citations during review. If a source does not support a claim made on a page, <Link href="/help#report">tell us</Link>.</p>
      <ul className="list-none p-0 m-0 grid gap-3">
        {sorted.map((s) => (
          <li key={s.id} className="card p-4" id={s.id}>
            <div className="flex gap-2 flex-wrap items-center"><span className="chip">{TYPE[s.type]}</span><b>{s.title}</b></div>
            <div className="text-sm muted mt-1">{s.author}{s.year ? ` · ${s.year}` : ""}{s.note ? ` · ${s.note}` : ""}</div>
            {s.url && <a className="text-sm" href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https?:\/\//, "")}</a>}
            <div className="text-xs muted mt-2">Used in {(used.get(s.id) ?? []).length} entries{(used.get(s.id) ?? []).length ? ": " : ""}
              {(used.get(s.id) ?? []).slice(0, 6).map((k, i) => <span key={k}>{i ? ", " : ""}<Link href={"/" + k}>{k.split("/")[1].replace(/-/g, " ")}</Link></span>)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
