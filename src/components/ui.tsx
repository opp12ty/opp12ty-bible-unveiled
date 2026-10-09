import Link from "next/link";
import type { ReactNode } from "react";
import { KIND_META, key, source, type Entry } from "@/content";

import { Art, EvidenceBadge, StatusBadge } from "./visual";
export { Art, EVIDENCE, EvidenceBadge, StatusBadge, VISUAL_LABEL } from "./visual";

/* ---------- cards ---------- */
export function EntryCard({ e, compact }: { e: Entry; compact?: boolean }) {
  const meta = KIND_META[e.kind];
  return (
    <Link href={"/" + key(e)} className="card card-hover block no-underline overflow-hidden h-full" style={{ color: "var(--text)" }}>
      {!compact && <Art entry={e} h={96} label={false} />}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="chip">{meta.label}</span>
          {e.premium && <span className="chip" style={{ color: "var(--gold-soft)", borderColor: "var(--gold)" }}>Vault</span>}
        </div>
        <h3 className="m-0 text-lg leading-snug">{e.title}</h3>
        <p className="muted text-sm m-0 mt-1">{e.summary}</p>
      </div>
    </Link>
  );
}

export function SourceList({ ids, title = "Sources" }: { ids: string[]; title?: string }) {
  const list = ids.map((i) => source(i)).filter(Boolean);
  if (!list.length) return null;
  return (
    <section aria-labelledby="sources-h" className="mt-8">
      <h2 id="sources-h" className="text-xl m-0 mb-2">{title}</h2>
      <ol className="m-0 pl-5 grid gap-1.5 text-sm">
        {list.map((s) => (
          <li key={s!.id} id={"src-" + s!.id}>
            <span className="font-semibold">{s!.title}</span> — {s!.author}{s!.year ? ` (${s!.year})` : ""}
            {s!.note ? <span className="muted"> · {s!.note}</span> : null}
            {s!.url ? <> · <a href={s!.url} rel="noopener noreferrer" target="_blank">archive</a></> : null}
          </li>
        ))}
      </ol>
      <p className="muted text-xs mt-2">Sources are listed at the level of the work. Page-level citations are added during editorial review. <Link href="/method">How we use sources</Link></p>
    </section>
  );
}

export function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>{eyebrow}</div>}
        <h2 className="m-0 text-2xl sm:text-3xl">{title}</h2>
        {sub && <p className="muted m-0 mt-1 max-w-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm muted mb-3">
      <ol className="flex flex-wrap gap-1 list-none p-0 m-0">
        {items.map((c, i) => (
          <li key={i} className="flex gap-1">
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-20" style={{ borderTop: "1px solid var(--line)", background: "rgba(6,10,22,.7)" }}>
      <div className="wrap py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div className="md:col-span-2">
          <div className="serif text-xl" style={{ color: "var(--gold-soft)" }}>BIBLE UNVEILED</div>
          <p className="muted max-w-md">We don&apos;t tell you what to think. We give you the tools to investigate. An educational research platform by PreciousPs.</p>
          <p className="muted text-xs max-w-md">Reconstructions and illustrations are labelled. AI output is labelled. Where evidence is uncertain, we say so.</p>
        </div>
        <div>
          <h2 className="text-base m-0 mb-2">Explore</h2>
          <ul className="list-none p-0 m-0 grid gap-1">
            <li><Link href="/investigations">Bible Detective</Link></li>
            <li><Link href="/oddity-vault">Oddity Vault</Link></li>
            <li><Link href="/map">Map</Link></li>
            <li><Link href="/timeline">Timeline</Link></li>
            <li><Link href="/bible">Scripture</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-base m-0 mb-2">Trust</h2>
          <ul className="list-none p-0 m-0 grid gap-1">
            <li><Link href="/method">Methodology</Link></li>
            <li><Link href="/sources">Sources</Link></li>
            <li><Link href="/help">Help &amp; reporting errors</Link></li>
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/terms">Terms</Link></li>
            <li><Link href="/legal/accessibility">Accessibility</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap pb-8 muted text-xs">© {new Date().getFullYear()} PreciousPs · BIBLE UNVEILED. Scripture texts used: KJV, ASV, Berean Standard Bible, Westminster Leningrad Codex, Textus Receptus (all public domain).</div>
    </footer>
  );
}
