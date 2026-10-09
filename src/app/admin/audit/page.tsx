import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { q } from "@/server/db";

export const metadata: Metadata = { title: "Audit log", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Audit() {
  return (
    <AdminShell need="admin">
      {async () => {
        const rows = await q<{ id: number; at: string; actor: string | null; action: string; target: string | null }>("select id, at, actor, action, target from audit order by id desc limit 200");
        return (
          <div className="grid gap-4">
            <h1 className="m-0 text-3xl">Audit log</h1>
            <div className="card overflow-auto"><table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead><tr className="text-left muted"><th className="p-3">When</th><th className="p-3">Who</th><th className="p-3">Action</th><th className="p-3">Target</th></tr></thead>
              <tbody>{rows.map((r) => <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}><td className="p-3 whitespace-nowrap">{new Date(r.at).toISOString().replace("T", " ").slice(0, 19)}</td><td className="p-3">{r.actor}</td><td className="p-3">{r.action}</td><td className="p-3 muted">{r.target}</td></tr>)}</tbody>
            </table></div>
          </div>
        );
      }}
    </AdminShell>
  );
}
