import type { Metadata } from "next";
import Link from "next/link";
import { ALL } from "@/content";
import { currentUser } from "@/server/auth";
import { hasDb } from "@/server/db";
import { EntryCard, Crumbs } from "@/components/ui";
import { key } from "@/content";

export const metadata: Metadata = { title: "The Vault", description: "Advanced investigations and premium study collections." };
export const dynamic = "force-dynamic";

export default async function Vault() {
  const items = ALL.filter((e) => e.premium);
  const u = await currentUser();
  const entitled = Boolean(u && (u.plan !== "free" || u.role !== "user"));
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "The Vault" }]} />
      <h1 className="m-0 text-4xl" style={{ color: "var(--gold-soft)" }}>The Vault</h1>
      <p className="muted max-w-2xl mt-2">Advanced case files and deeper study material. What is free and what is paid is always stated plainly: everything outside this page is free.</p>
      <div className="card p-4 my-5" role="status">
        {!hasDb()
          ? "Accounts are not configured on this deployment yet, so Vault material is open for preview. Entitlement checks switch on automatically when accounts are enabled."
          : entitled ? `Your plan (${u!.plan}) includes the Vault.` : u ? "Your account is on the Free plan. Vault entries are locked." : "Sign in to see whether your plan includes the Vault."}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((e) => <EntryCard key={key(e)} e={e} />)}</div>
      <div className="flex gap-2 mt-8"><Link href="/pricing" className="neon neon-gold no-underline">Compare memberships</Link></div>
    </div>
  );
}
