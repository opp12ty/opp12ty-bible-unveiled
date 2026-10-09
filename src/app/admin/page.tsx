import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { q } from "@/server/db";
import { stats } from "@/content";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };
export const dynamic = "force-dynamic";

const ROADMAP: [string, string][] = [
  ["Live", "Case files, Oddity Vault, belief checks, interpretation arena, silence explorer, evidence lab, map, timeline, knowledge graph, scripture reader, original languages, My Journey, quizzes, source-grounded AI brief"],
  ["Live (needs configuration)", "Accounts and sync, content workflow, community questions, error reports (DATABASE_URL); generated AI answers (ANTHROPIC_API_KEY)"],
  ["Staged", "Online payments and receipts, institutional classrooms, additional languages and RTL, push notifications, licensed photography and 3D city reconstructions, ancient-sound library, simulations (Ancient Life, Live Like the Ancients), page-level citations"],
];

export default async function Admin() {
  return (
    <AdminShell>
      {async () => {
        const [users] = await q<{ n: string }>("select count(*)::text n from users");
        const [reports] = await q<{ n: string }>("select count(*)::text n from reports where status='open'");
        const [pending] = await q<{ n: string }>("select count(*)::text n from questions where status='pending'");
        const [review] = await q<{ n: string }>("select count(*)::text n from cms_entries where status='pending-review'");
        const ev = await q<{ name: string; n: string }>("select name, sum(n)::text n from events where day > current_date - 14 group by name order by sum(n) desc");
        const s = stats();
        const tiles: [string, string][] = [["Registered users", users.n], ["Open error reports", reports.n], ["Questions awaiting moderation", pending.n], ["Entries awaiting review", review.n], ["Reviewed content entries", String(s.entries)], ["Sources", String(s.sources)]];
        return (
          <div className="grid gap-6">
            <h1 className="m-0 text-3xl">Dashboard</h1>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">{tiles.map(([k, v]) => <div key={k} className="card p-4"><div className="text-3xl serif" style={{ color: "var(--gold-soft)" }}>{v}</div><div className="muted text-sm">{k}</div></div>)}</div>
            <section className="card p-5"><h2 className="m-0 text-xl">Usage, last 14 days</h2>
              {ev.length === 0 ? <p className="muted">No events yet.</p> : <ul className="m-0 mt-2 pl-5">{ev.map((e) => <li key={e.name}>{e.name}: <b>{e.n}</b></li>)}</ul>}
              <p className="muted text-xs mb-0">Anonymous counters only: no identifiers, IPs or search text are stored.</p></section>
            <section className="card p-5"><h2 className="m-0 text-xl">Roadmap</h2>
              <ul className="list-none p-0 m-0 mt-2 grid gap-3">{ROADMAP.map(([k, v]) => <li key={k}><span className="chip">{k}</span><p className="m-0 mt-1 text-sm">{v}</p></li>)}</ul></section>
          </div>
        );
      }}
    </AdminShell>
  );
}
