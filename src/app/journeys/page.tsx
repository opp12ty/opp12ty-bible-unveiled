import type { Metadata } from "next";
import Link from "next/link";
import { JOURNEYS, get, KIND_META } from "@/content";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Learning Journeys", description: "Guided paths through investigations, discoveries and manuscripts." };

export default function Journeys() {
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Learning journeys" }]} />
      <h1 className="m-0 text-4xl">Learning Journeys</h1>
      <p className="muted mt-2 mb-6">Curated sequences. Each step is a normal page, so you can stop, branch and return.</p>
      <div className="grid gap-5">
        {JOURNEYS.map((j) => (
          <section key={j.slug} id={j.slug} className="card p-5">
            <h2 className="m-0 text-2xl">{j.title}</h2>
            <p className="muted m-0 mt-1">{j.blurb} · about {j.minutes} minutes</p>
            <ol className="mt-4 mb-0 pl-5 grid gap-2">
              {j.steps.map((s) => { const e = get(s); return e ? <li key={s}><Link href={"/" + s}><b>{e.title}</b></Link> <span className="chip ml-1">{KIND_META[e.kind].label}</span></li> : null; })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
