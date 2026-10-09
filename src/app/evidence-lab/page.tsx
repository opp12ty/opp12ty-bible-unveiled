import type { Metadata } from "next";
import Link from "next/link";
import { byKind, type Investigation, type Status } from "@/content";
import { EvidenceBadge, StatusBadge, EVIDENCE } from "@/components/ui";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Evidence Lab", description: "How BIBLE UNVEILED classifies evidence and confidence, with every claim from our investigations in one place." };

const STATUS_DEF: [Status, string][] = [
  ["documented", "Directly attested by a primary witness (a text, inscription, artefact or manuscript) that can be inspected."],
  ["well-supported", "Several independent lines of evidence agree and no serious alternative explains them equally well."],
  ["likely", "The best available explanation, but a reasonable alternative remains."],
  ["debated", "Informed specialists disagree and the evidence does not settle the matter."],
  ["unknown", "The evidence does not allow an answer; or the claim goes beyond what the sources say."],
];
const KIND_DEF: Record<string, string> = {
  scripture: "What the biblical text itself says.", "original-language": "Observations about Hebrew, Aramaic or Greek wording.",
  history: "Reconstruction of events and context from multiple sources.", "ancient-sources": "Ancient authors and inscriptions outside the Bible.",
  archaeology: "Material remains and their dating.", manuscripts: "Surviving copies and their readings.", scholarship: "Modern scholarly interpretation or proposal.",
  tradition: "Later religious or communal tradition.", "popular-culture": "Widespread belief or depiction, not evidence in itself.", speculation: "Hypothesis not supported by direct evidence.",
};

export default function EvidenceLab() {
  const invs = byKind<Investigation>("investigations");
  const claims = invs.flatMap((i) => i.claims.map((c) => ({ ...c, from: i }))).sort((a, b) => a.status.localeCompare(b.status));
  return (
    <div className="wrap py-8 max-w-5xl grid gap-8">
      <div>
        <Crumbs items={[{ href: "/", label: "Home" }, { label: "Evidence Lab" }]} />
        <h1 className="m-0 text-4xl">Evidence Lab</h1>
        <p className="muted max-w-2xl mt-2">Evidence is classified by <b>kind</b> and by <b>confidence</b>. We do not assign truth percentages: no single number can settle a historical or theological question, and evidence for a narrow claim does not establish a broad conclusion.</p>
      </div>
      <section aria-labelledby="conf"><h2 id="conf" className="text-2xl m-0 mb-3">Confidence vocabulary</h2>
        <ul className="list-none p-0 m-0 grid gap-2">{STATUS_DEF.map(([s, d]) => <li key={s} className="card p-3 flex gap-3 items-start flex-wrap"><StatusBadge s={s} /><span className="flex-1 min-w-48">{d}</span></li>)}</ul>
      </section>
      <section aria-labelledby="kinds"><h2 id="kinds" className="text-2xl m-0 mb-3">Kinds of evidence</h2>
        <ul className="list-none p-0 m-0 grid gap-2 sm:grid-cols-2">{Object.keys(EVIDENCE).map((k) => <li key={k} className="card p-3"><EvidenceBadge k={k as keyof typeof EVIDENCE} /><p className="m-0 mt-1 text-sm">{KIND_DEF[k]}</p></li>)}</ul>
      </section>
      <section aria-labelledby="claims"><h2 id="claims" className="text-2xl m-0 mb-1">Every claim, with its limits</h2>
        <p className="muted text-sm mt-0">{claims.length} claims drawn from {invs.length} investigations.</p>
        <ul className="list-none p-0 m-0 grid gap-3">
          {claims.map((c, i) => (
            <li key={i} className="card p-4 grid gap-2">
              <div className="font-semibold">{c.text}</div>
              <div className="flex gap-2 flex-wrap"><EvidenceBadge k={c.kind} /><StatusBadge s={c.status} /></div>
              <div className="text-sm"><span className="muted">Limits:</span> {c.limits}</div>
              <div className="text-xs muted">From <Link href={`/investigations/${c.from.slug}`}>{c.from.title}</Link></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
