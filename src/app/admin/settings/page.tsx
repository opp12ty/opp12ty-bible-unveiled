import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { SettingsForms } from "@/components/AdminForms";
import { getSettings } from "@/server/settings";
import { NAV } from "@/lib/nav";
import { byKind, key, type Investigation } from "@/content";

export const metadata: Metadata = { title: "Site settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <AdminShell need="admin">
      {async () => {
        const s = await getSettings();
        const nav: [string, string][] = NAV.flatMap((g) => g.items.map((i) => [i.href, `${g.label} › ${i.label}`] as [string, string]));
        const entries: [string, string][] = byKind<Investigation>("investigations").map((e) => [key(e), e.title]);
        return (
          <div className="grid gap-4">
            <h1 className="m-0 text-3xl">Site settings</h1>
            <SettingsForms s={s} navOptions={nav} entryOptions={entries} />
          </div>
        );
      }}
    </AdminShell>
  );
}
