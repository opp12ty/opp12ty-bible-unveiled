import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { getSettings } from "@/server/settings";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Membership", description: "Plans for BIBLE UNVEILED and exactly what each includes." };
export const revalidate = 60;

export default async function Pricing() {
  const st = await getSettings();
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Membership" }]} />
      <h1 className="m-0 text-4xl">Membership</h1>
      <p className="muted max-w-2xl mt-2">Free access is real and substantial. Paid plans add depth and tools; they never change what the evidence says.</p>
      {!st.flags.payments && (
        <div className="card p-4 my-5" role="status" style={{ borderColor: "rgba(243,171,60,.5)" }}>
          <b>Online payment is not switched on yet.</b> Prices below are indicative. Until a payment provider is connected, access to paid plans can be granted by an administrator, and nothing on this site will take a payment.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {st.plans.map((p, i) => (
          <section key={p.id} className="card p-6 flex flex-col" style={i === 1 ? { borderColor: "var(--gold)" } : undefined}>
            <h2 className="m-0 text-2xl">{p.name}</h2>
            <div className="serif text-3xl mt-2" style={{ color: "var(--gold-soft)" }}>{p.price}</div>
            <p className="muted">{p.blurb}</p>
            <ul className="list-none p-0 m-0 grid gap-2 flex-1">{p.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} style={{ color: "var(--emerald)", flex: "none", marginTop: 4 }} />{f}</li>)}</ul>
            <Link href={p.id === "free" ? "/register" : "/help#plans"} className={`neon no-underline mt-5 ${i === 1 ? "neon-gold" : "neon-ghost"}`}>{p.id === "free" ? "Create a free account" : "Ask about this plan"}</Link>
          </section>
        ))}
      </div>
    </div>
  );
}
