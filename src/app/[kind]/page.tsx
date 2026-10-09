import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL, KINDS, KIND_META, key, type Entry, type Kind } from "@/content";
import { managedOddities } from "@/server/cms";
import { Browse, type BrowseItem } from "@/components/Browse";
import { Crumbs } from "@/components/ui";

export const revalidate = 120;
export const dynamicParams = false;

export function generateStaticParams() { return KINDS.map((kind) => ({ kind })); }

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> {
  const { kind } = await params;
  const m = KIND_META[kind as Kind];
  return m ? { title: m.plural, description: m.blurb } : {};
}

function badge(e: Entry): string | undefined {
  if (e.kind === "investigations") return e.difficulty.replace("-", " ");
  if (e.kind === "belief-check") return e.verdict.replace(/-/g, " ");
  if (e.kind === "oddity-vault") return e.label.replace("-", " ");
  if (e.kind === "archaeology") return e.connection + " link";
  return undefined;
}

export default async function KindIndex({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!KINDS.includes(kind as Kind)) notFound();
  const k = kind as Kind;
  const meta = KIND_META[k];
  let list: Entry[] = ALL.filter((e) => e.kind === k);
  if (k === "oddity-vault") list = [...list, ...(await managedOddities())];
  const items: BrowseItem[] = list.map((e) => ({ k: key(e), kind: e.kind, kindLabel: meta.label, title: e.title, summary: e.summary, tags: e.tags, art: e.art, premium: e.premium, badge: badge(e) }));
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: meta.plural }]} />
      <h1 className="m-0 text-4xl">{meta.plural}</h1>
      <p className="muted text-lg max-w-2xl mt-2 mb-6">{meta.blurb}</p>
      <Browse items={items} />
    </div>
  );
}
