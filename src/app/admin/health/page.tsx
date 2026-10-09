import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { q } from "@/server/db";
import { brokenLinks, stats } from "@/content";

export const metadata: Metadata = { title: "System health", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Health() {
  return (
    <AdminShell need="admin">
      {async () => {
        let db = "ok";
        try { await q("select 1"); } catch { db = "unreachable"; }
        const broken = brokenLinks();
        const s = stats();
        const env: [string, boolean][] = [
          ["DATABASE_URL", Boolean(process.env.DATABASE_URL)], ["SETUP_TOKEN", Boolean(process.env.SETUP_TOKEN)],
          ["ANTHROPIC_API_KEY (generated AI answers)", Boolean(process.env.ANTHROPIC_API_KEY)], ["NEXT_PUBLIC_SITE_URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
        ];
        return (
          <div className="grid gap-4">
            <h1 className="m-0 text-3xl">System health</h1>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="card p-4"><h2 className="m-0 text-lg">Database</h2><p className="m-0">{db === "ok" ? "✓ Connected" : "✗ Unreachable"}</p></div>
              <div className="card p-4"><h2 className="m-0 text-lg">Content integrity</h2><p className="m-0">{broken.length === 0 ? "✓ All links and source ids resolve" : `✗ ${broken.length} broken references`}</p>{broken.slice(0, 10).map((b) => <div key={b} className="text-xs muted">{b}</div>)}<p className="m-0 muted text-xs mt-2">{s.entries} entries · {s.sources} sources · {s.links} links</p></div>
            </div>
            <div className="card p-4"><h2 className="m-0 text-lg">Environment (values never shown)</h2>
              <ul className="m-0 pl-5">{env.map(([k, ok]) => <li key={k}>{ok ? "✓" : "—"} {k}</li>)}</ul></div>
          </div>
        );
      }}
    </AdminShell>
  );
}
