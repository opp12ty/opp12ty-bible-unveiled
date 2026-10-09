import "server-only";
import { hasDb, q } from "./db";
import type { Oddity } from "@/content/types";

interface Row { slug: string; data: Record<string, unknown>; status: string; scheduled_at: string | null }

/** Managed Oddity Vault entries that are published (or whose scheduled time has arrived). */
export async function managedOddities(): Promise<Oddity[]> {
  if (!hasDb()) return [];
  try {
    const rows = await q<Row>(
      `select slug, data, status, scheduled_at from cms_entries
       where kind='oddity-vault' and (status='published' or (status='scheduled' and scheduled_at <= now()))`);
    return rows.map((r) => {
      const d = r.data as Record<string, unknown>;
      return {
        kind: "oddity-vault", slug: r.slug, title: String(d.title), summary: String(d.summary), tags: (d.tags as string[]) ?? [],
        sources: (d.sources as string[]) ?? [], links: [], art: "violet", visual: "schematic-diagram",
        question: String(d.question), explanation: (d.explanation as string[]) ?? [], context: String(d.context ?? ""),
        bible: d.bible ? String(d.bible) : undefined, evidence: String(d.evidence ?? ""), uncertainties: String(d.uncertainties ?? ""),
        ageOk: (d.ageOk as Oddity["ageOk"]) ?? "all", label: (d.label as Oddity["label"]) ?? "unexpected", status: "likely",
      } satisfies Oddity;
    });
  } catch (e) {
    console.error("managedOddities failed", e);
    return [];
  }
}
