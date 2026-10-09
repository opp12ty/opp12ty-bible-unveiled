import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { CmsManager, type CmsRow } from "@/components/AdminForms";
import { q } from "@/server/db";
import { SOURCES } from "@/content";

export const metadata: Metadata = { title: "Content workflow", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Content() {
  return (
    <AdminShell>
      {async (u) => {
        const rows = await q<CmsRow>("select id, slug, status, version, updated_by, data from cms_entries order by updated_at desc limit 100");
        return (
          <div className="grid gap-4">
            <h1 className="m-0 text-3xl">Content workflow</h1>
            <p className="muted m-0 max-w-2xl">Draft → pending review → published. Publishing is blocked until sources, evidence and uncertainties are filled in, and every save keeps a revision. Edits to live entries return to review.</p>
            <CmsManager rows={rows} sourceOptions={SOURCES.map((s) => [s.id, `${s.title} — ${s.author}`])} isAdmin={u.role === "admin"} />
          </div>
        );
      }}
    </AdminShell>
  );
}
