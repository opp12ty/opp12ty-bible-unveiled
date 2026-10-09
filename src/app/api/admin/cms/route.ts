import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, audit, requireRole } from "@/server/auth";
import { one, q } from "@/server/db";
import { source } from "@/content";

/**
 * Editorial workflow for managed Oddity Vault entries.
 * draft -> pending-review (editor or admin) -> approved -> published | scheduled (admin only) ; rejected / archived.
 * Publishing is refused unless the research fields are complete: sources, uncertainty, evidence statement.
 */
const Data = z.object({
  title: z.string().trim().min(4).max(140),
  question: z.string().trim().min(8).max(240),
  summary: z.string().trim().min(10).max(300),
  explanation: z.array(z.string().trim().min(1).max(1200)).min(1).max(6),
  context: z.string().trim().max(800).default(""),
  bible: z.string().trim().max(200).optional(),
  evidence: z.string().trim().max(800).default(""),
  uncertainties: z.string().trim().max(800).default(""),
  sources: z.array(z.string()).max(12).default([]),
  tags: z.array(z.string().trim().max(30)).max(8).default([]),
  label: z.enum(["strange", "beautiful", "forgotten", "misunderstood", "mysterious", "unexpected", "rarely-taught"]).default("unexpected"),
  ageOk: z.enum(["all", "teen+", "adult"]).default("all"),
});

const STATUSES = ["draft", "pending-review", "approved", "scheduled", "published", "rejected", "needs-revision", "archived"] as const;
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function publishProblems(d: z.infer<typeof Data>): string[] {
  const p: string[] = [];
  if (d.sources.length === 0) p.push("Add at least one source.");
  for (const s of d.sources) if (!source(s)) p.push(`Unknown source id: ${s}`);
  if (d.uncertainties.trim().length < 10) p.push("State the uncertainties.");
  if (d.evidence.trim().length < 10) p.push("Describe the evidence.");
  return p;
}

export const GET = api(async () => {
  await requireRole("editor", "admin");
  const rows = await q("select id, kind, slug, status, version, updated_by, updated_at, scheduled_at, data from cms_entries order by updated_at desc limit 200");
  return { entries: rows };
}, { db: true });

const Create = z.object({ data: Data });
export const POST = api(async (req: Request) => {
  const u = await requireRole("editor", "admin");
  const { data } = Create.parse(await req.json());
  let slug = slugify(data.title);
  if (!slug) throw new HttpError(400, "Give the entry a title.");
  if (await one("select 1 from cms_entries where kind='oddity-vault' and slug=$1", [slug])) slug += "-" + Math.random().toString(36).slice(2, 6);
  const [row] = await q<{ id: number }>(
    "insert into cms_entries (kind, slug, data, status, created_by, updated_by) values ('oddity-vault',$1,$2,'draft',$3,$3) returning id",
    [slug, JSON.stringify(data), u.email]);
  await q("insert into cms_revisions (entry_id, version, data, status, by_user, note) values ($1,1,$2,'draft',$3,'Created')", [row.id, JSON.stringify(data), u.email]);
  await audit(u.email, "cms.create", slug);
  return { ok: true, id: row.id, slug };
}, { db: true });

const Patch = z.object({
  id: z.number().int().positive(),
  data: Data.optional(),
  status: z.enum(STATUSES).optional(),
  scheduledAt: z.string().datetime().optional(),
  note: z.string().trim().max(200).optional(),
});

export const PATCH = api(async (req: Request) => {
  const u = await requireRole("editor", "admin");
  const b = Patch.parse(await req.json());
  const cur = await one<{ id: number; slug: string; data: z.infer<typeof Data>; status: string; version: number }>("select id, slug, data, status, version from cms_entries where id=$1", [b.id]);
  if (!cur) throw new HttpError(404, "Entry not found");
  const data = b.data ?? cur.data;
  let status = b.status ?? cur.status;
  if (["approved", "scheduled", "published", "rejected", "archived"].includes(status) && u.role !== "admin") {
    throw new HttpError(403, "Only administrators can approve, publish, reject or archive.");
  }
  if (status === "published" || status === "scheduled") {
    const problems = publishProblems(data);
    if (problems.length) throw new HttpError(422, "Cannot publish yet: " + problems.join(" "));
  }
  if (b.data && cur.status === "published" && !b.status) status = "pending-review"; // edits to live content go back to review
  const version = b.data ? cur.version + 1 : cur.version;
  await q(
    `update cms_entries set data=$2, status=$3, version=$4, updated_by=$5, updated_at=now(), scheduled_at=$6 where id=$1`,
    [b.id, JSON.stringify(data), status, version, u.email, status === "scheduled" ? b.scheduledAt ?? null : null]);
  await q("insert into cms_revisions (entry_id, version, data, status, by_user, note) values ($1,$2,$3,$4,$5,$6)",
    [b.id, version, JSON.stringify(data), status, u.email, b.note ?? null]);
  await audit(u.email, "cms.update", cur.slug, { status, version });
  return { ok: true, status, version };
}, { db: true });
