import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { KIND_META, SOURCES, key, neighbours, type Entry, type BeliefVerdict } from "@/content";
import { parseRef, refHref } from "@/core/bible";
import { resolveRef } from "@/server/bible";
import { Art, Crumbs, EntryCard, EvidenceBadge, SectionHead, SourceList, StatusBadge } from "./ui";
import { InvestigationReader } from "./Investigation";
import { ObjectGame } from "./ObjectGame";
import { ReportError, SaveButton, ShareButton, Visit } from "./bits";

const VERDICT: Record<BeliefVerdict, { label: string; color: string; mark: string }> = {
  "explicitly-stated": { label: "Explicitly stated", color: "var(--emerald)", mark: "✓" },
  implied: { label: "Implied or inferred", color: "var(--blue)", mark: "≈" },
  "later-tradition": { label: "Later tradition", color: "var(--violet)", mark: "⌛" },
  "scholarly-interpretation": { label: "Scholarly interpretation", color: "var(--amber)", mark: "◇" },
  "not-established": { label: "Not established by the text", color: "var(--red)", mark: "✗" },
};

export function RefLinks({ passages }: { passages: string[] }) {
  if (!passages.length) return null;
  return (
    <ul className="list-none p-0 m-0 flex flex-wrap gap-2">
      {passages.map((p) => {
        const r = parseRef(p);
        return <li key={p}>{r ? <Link className="chip no-underline" style={{ color: "var(--gold-soft)" }} href={refHref(r)}>{p}</Link> : <span className="chip">{p}</span>}</li>;
      })}
    </ul>
  );
}

function PassagePreview({ passages }: { passages: string[] }) {
  const items = passages.map((p) => ({ p, r: resolveRef(p) })).filter((x) => x.r && x.r.verses.length).slice(0, 2);
  if (!items.length) return null;
  return (
    <section aria-labelledby="pp" className="parchment p-5">
      <h2 id="pp" className="m-0 text-lg">The text (KJV)</h2>
      {items.map(({ p, r }) => (
        <blockquote key={p} className="m-0 mt-3 pl-3" style={{ borderLeft: "3px solid var(--gold)" }}>
          <div className="text-xs font-bold uppercase tracking-wider muted">{r!.label}</div>
          {r!.verses.slice(0, 6).map((v) => <span key={v.v}><sup className="muted">{v.v}</sup> {v.text} </span>)}
          <div className="mt-1"><Link href={r!.href}>Read in context →</Link></div>
        </blockquote>
      ))}
    </section>
  );
}

const Col = ({ title, items, tone }: { title: string; items?: string[]; tone: string }) => !items?.length ? null : (
  <div className="card p-4" style={{ borderTop: `3px solid ${tone}` }}>
    <h3 className="m-0 text-base">{title}</h3>
    <ul className="m-0 mt-2 pl-5 grid gap-1.5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul>
  </div>
);

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="card p-4 grid gap-3 sm:grid-cols-2 m-0">
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <div key={k}><dt className="text-xs uppercase tracking-widest muted">{k}</dt><dd className="m-0">{v}</dd></div>
      ))}
    </dl>
  );
}

function Body({ e }: { e: Entry }) {
  const titles = Object.fromEntries(SOURCES.map((s) => [s.id, `${s.title} (${s.author})`]));
  switch (e.kind) {
    case "investigations":
      return (
        <div className="grid gap-6">
          <div className="card p-4"><div className="text-xs uppercase tracking-widest muted">The question</div><p className="m-0 text-xl serif">{e.question}</p>
            <div className="mt-3 flex flex-wrap gap-2 items-center"><span className="chip">Difficulty: {e.difficulty.replace("-", " ")}</span><span className="chip">{e.minutes} min</span><span className="chip">{e.period}</span></div></div>
          <PassagePreview passages={e.passages} />
          <InvestigationReader inv={e} sourceTitles={titles} base={key(e)} />
        </div>
      );
    case "oddity-vault":
      return (
        <div className="grid gap-5">
          <div className="card p-5"><div className="text-xs uppercase tracking-widest muted">Curious question</div><p className="m-0 text-2xl serif">{e.question}</p></div>
          <div className="parchment p-5 sm:p-7">
            <h2 className="m-0 text-xl">Explanation</h2>
            {e.explanation.map((p, i) => <p key={i} className="mt-2 mb-0">{p}</p>)}
            <h3 className="mt-5 mb-1 text-lg">Historical context</h3><p className="m-0">{e.context}</p>
            {e.bible && <><h3 className="mt-5 mb-1 text-lg">Biblical connection</h3><p className="m-0">{e.bible}</p></>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card p-4"><h3 className="m-0 text-lg">Evidence</h3><p className="m-0 mt-1">{e.evidence}</p></div>
            <div className="card p-4" style={{ borderColor: "rgba(174,149,255,.5)" }}><h3 className="m-0 text-lg">Uncertainties</h3><p className="m-0 mt-1">{e.uncertainties}</p></div>
          </div>
          <div className="flex gap-2 flex-wrap"><StatusBadge s={e.status} /><span className="chip">Editorial label: {e.label.replace("-", " ")}</span><span className="chip">Age: {e.ageOk}</span></div>
        </div>
      );
    case "belief-check": {
      const v = VERDICT[e.verdict];
      return (
        <div className="grid gap-5">
          <div className="card p-5"><div className="text-xs uppercase tracking-widest muted">The claim</div><p className="m-0 text-2xl serif">&ldquo;{e.claim}&rdquo;</p></div>
          <div className="card p-5" style={{ borderColor: v.color }}>
            <div className="chip" style={{ color: v.color, borderColor: v.color }}><span aria-hidden>{v.mark}</span>{v.label}</div>
            <p className="m-0 mt-3 text-lg">{e.why}</p>
          </div>
          <PassagePreview passages={e.passages} />
          <div className="grid gap-3 md:grid-cols-2">
            <Col title="What the text says" items={e.text} tone="var(--gold)" />
            <Col title="What later tradition says" items={e.tradition} tone="var(--violet)" />
            <Col title="What scholarship says" items={e.scholarship} tone="var(--blue)" />
            <Col title="What popular culture says" items={e.popular} tone="var(--muted)" />
          </div>
          <p className="muted text-sm m-0">Complex interpretive questions are not forced into true/false. The label describes the relationship between the claim and the text.</p>
        </div>
      );
    }
    case "interpretations":
      return (
        <div className="grid gap-5">
          <div className="card p-5"><div className="text-xs uppercase tracking-widest muted">{e.mode === "textual-difference" ? "Textual difference" : "Competing interpretations"}</div><p className="m-0 text-2xl serif">{e.question}</p><RefLinks passages={e.passages} /></div>
          <p className="muted m-0">{e.note}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {e.positions.map((p) => (
              <article key={p.label} className="card p-4 grid gap-2 content-start">
                <div className="flex gap-2 items-center flex-wrap"><h3 className="m-0 text-lg">{p.label}</h3><span className="chip">{p.nature}</span></div>
                <p className="m-0">{p.position}</p>
                <div className="text-sm"><b>Support</b><ul className="m-0 pl-5">{p.support.map((x) => <li key={x}>{x}</li>)}</ul></div>
                <div className="text-sm"><b>Objections</b><ul className="m-0 pl-5">{p.objections.map((x) => <li key={x}>{x}</li>)}</ul></div>
              </article>
            ))}
          </div>
        </div>
      );
    case "silence":
      return (
        <div className="grid gap-4">
          <div className="card p-4"><div className="text-xs uppercase tracking-widest muted">Passage</div><RefLinks passages={e.passage.split(/;\s*/)} /></div>
          <div className="grid gap-3 md:grid-cols-2">
            <Col title="What the text says" items={e.says} tone="var(--gold)" />
            <Col title="What the text implies" items={e.implies} tone="var(--blue)" />
            <Col title="What later traditions propose" items={e.tradition} tone="var(--violet)" />
            <Col title="What scholarship discusses" items={e.scholarship} tone="var(--emerald)" />
          </div>
          <Col title="What remains unknown" items={e.unknown} tone="var(--red)" />
          <p className="muted text-sm m-0">We never fill a gap in the text with an invented answer.</p>
        </div>
      );
    case "people":
      return (
        <div className="grid gap-4">
          <Facts rows={[["Role", e.role], ["Period", e.period], ["Outside the Bible", e.outside]]} />
          <div className="prose-ub card p-5">{e.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <RefLinks passages={e.passages} />
        </div>
      );
    case "places":
      return (
        <div className="grid gap-4">
          <Facts rows={[["Modern equivalent", e.modern], ["Identification", e.location === "known" ? "Securely located" : e.location === "proposed" ? "Proposed identification" : "Disputed location"], ["Period", e.period], ["Coordinates", `${e.lat.toFixed(3)}, ${e.lng.toFixed(3)}`]]} />
          <div className="prose-ub card p-5">{e.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="flex gap-2 flex-wrap"><Link className="neon neon-blue neon-sm no-underline" href={`/map?focus=${e.slug}`}><MapPin size={16} />Show on the map</Link><RefLinks passages={e.passages} /></div>
        </div>
      );
    case "archaeology":
      return (
        <div className="grid gap-4">
          <Facts rows={[["Site", e.site], ["Found", e.year], ["Held", e.holding]]} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card p-4"><h3 className="m-0 text-base">1 · What was physically found</h3><p className="m-0 mt-1">{e.found}</p></div>
            <div className="card p-4"><h3 className="m-0 text-base">2 · How it was dated</h3><p className="m-0 mt-1">{e.dating}</p></div>
            <div className="card p-4"><h3 className="m-0 text-base">3 · What researchers infer</h3><p className="m-0 mt-1">{e.inference}</p></div>
            <div className="card p-4"><h3 className="m-0 text-base">4 · Biblical connection: <span style={{ color: "var(--gold-soft)" }}>{e.connection}</span></h3><p className="m-0 mt-1">{e.connectionNote}</p></div>
          </div>
          <div className="card p-4" style={{ borderColor: "rgba(243,171,60,.5)" }}><h3 className="m-0 text-base">Limitations</h3><p className="m-0 mt-1">{e.limits}</p></div>
          <RefLinks passages={e.passages} />
        </div>
      );
    case "manuscripts":
      return (
        <div className="grid gap-4">
          <Facts rows={[["Language", e.language], ["Work composed", e.composed], ["This copy dated", e.copied], ["Held", e.holding], ["Contents", e.content]]} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="card p-4"><h3 className="m-0 text-base">Why it matters</h3><p className="m-0 mt-1">{e.why}</p></div>
            <div className="card p-4" style={{ borderColor: "rgba(243,171,60,.5)" }}><h3 className="m-0 text-base">Limits</h3><p className="m-0 mt-1">{e.limits}</p></div>
          </div>
          <p className="muted text-sm m-0">The date a work was composed is not the date of the surviving manuscript. Both are shown.</p>
        </div>
      );
    case "ancient-world":
      return (
        <div className="grid gap-4">
          <Facts rows={[["Region", e.region], ["Period", e.period], ["Touches the Bible in", e.contact], ["Direct evidence of contact", e.directEvidence]]} />
          <div className="prose-ub card p-5">{e.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="card p-4" style={{ borderColor: "rgba(243,171,60,.5)" }}><h3 className="m-0 text-base">Caution</h3><p className="m-0 mt-1">{e.cautions}</p></div>
        </div>
      );
    case "objects":
      return <ObjectGame o={e} />;
  }
}

export function EntryView({ e }: { e: Entry }) {
  const meta = KIND_META[e.kind];
  const k = key(e);
  const rel = neighbours(k).slice(0, 6);
  return (
    <div className="wrap py-8">
      <Visit k={k} title={e.title} />
      <Crumbs items={[{ href: "/", label: "Home" }, { href: "/" + e.kind, label: meta.plural }, { label: e.title }]} />
      <header className="grid gap-4 md:grid-cols-[1.2fr_1fr] items-center mb-6">
        <div>
          <div className="flex gap-2 flex-wrap mb-2"><span className="chip">{meta.label}</span>{e.tags.slice(0, 3).map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <h1 className="m-0 text-3xl sm:text-5xl leading-tight">{e.title}</h1>
          <p className="muted text-lg mt-2 mb-4 max-w-prose">{e.summary}</p>
          <div className="flex gap-2 flex-wrap"><SaveButton k={k} /><ShareButton title={e.title} path={"/" + k} /></div>
        </div>
        <Art entry={e} h={170} />
      </header>
      <Body e={e} />
      {rel.length > 0 && (
        <section className="mt-10" aria-labelledby="deeper">
          <SectionHead eyebrow="Go deeper" title="Connected material" action={<Link className="neon neon-violet neon-sm no-underline" href={`/graph?focus=${k}`}>See in the knowledge graph <ArrowRight size={14} /></Link>} />
          <div id="deeper" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rel.map((r) => <EntryCard key={key(r)} e={r} compact />)}</div>
        </section>
      )}
      <SourceList ids={e.sources} />
      <ReportError path={"/" + k} />
    </div>
  );
}

export function EvidenceKinds({ list }: { list: Parameters<typeof EvidenceBadge>[0]["k"][] }) {
  return <div className="flex flex-wrap gap-2">{list.map((k) => <EvidenceBadge key={k} k={k} />)}</div>;
}
