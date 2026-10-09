import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL, KINDS, find, key, type Entry, type Kind } from "@/content";
import { managedOddities } from "@/server/cms";
import { currentUser } from "@/server/auth";
import { hasDb } from "@/server/db";
import { EntryView } from "@/components/EntryView";
import { Crumbs } from "@/components/ui";
import Link from "next/link";

export const revalidate = 120;
export const dynamicParams = true;

export function generateStaticParams() {
  // Premium entries are rendered on demand so the entitlement check always runs on the server.
  return ALL.filter((e) => !e.premium).map((e) => ({ kind: e.kind, slug: e.slug }));
}

async function lookup(kind: string, slug: string): Promise<Entry | undefined> {
  if (!KINDS.includes(kind as Kind)) return undefined;
  const e = find(kind as Kind, slug);
  if (e) return e;
  if (kind === "oddity-vault") return (await managedOddities()).find((o) => o.slug === slug);
  return undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string; slug: string }> }): Promise<Metadata> {
  const { kind, slug } = await params;
  const e = await lookup(kind, slug);
  if (!e) return {};
  return {
    title: e.title,
    description: e.summary,
    alternates: { canonical: `/${key(e)}` },
    openGraph: { title: e.title, description: e.summary, type: "article" },
  };
}

export default async function EntryPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const e = await lookup(kind, slug);
  if (!e) notFound();

  if (e.premium && hasDb()) {
    // Server-side entitlement check: premium plan, editor or admin.
    const u = await currentUser();
    const ok = u && (u.plan !== "free" || u.role !== "user");
    if (!ok) {
      return (
        <div className="wrap py-10 max-w-2xl">
          <Crumbs items={[{ href: "/", label: "Home" }, { href: "/vault", label: "The Vault" }, { label: e.title }]} />
          <h1 className="m-0 text-3xl">{e.title}</h1>
          <p className="muted">{e.summary}</p>
          <div className="card p-6 mt-4">
            <h2 className="m-0 text-xl">This is a Vault investigation</h2>
            <p>Vault material is included with Premium Investigator and Institutional plans, or granted by an administrator. {u ? "Your account is on the Free plan." : "Sign in to check your access."}</p>
            <div className="flex gap-2 flex-wrap"><Link href="/pricing" className="neon neon-gold no-underline">See membership options</Link>{!u && <Link href="/login" className="neon neon-ghost no-underline">Sign in</Link>}</div>
          </div>
        </div>
      );
    }
  }
  return <EntryView e={e} />;
}
