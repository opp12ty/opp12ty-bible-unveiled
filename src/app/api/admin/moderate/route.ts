import { z } from "zod";
import { api } from "@/server/http";
import { audit, requireRole } from "@/server/auth";
import { q } from "@/server/db";

const Body = z.discriminatedUnion("type", [
  z.object({ type: z.literal("question"), id: z.number().int(), status: z.enum(["approved", "rejected", "researching", "answered", "pending"]) }),
  z.object({ type: z.literal("report"), id: z.number().int(), status: z.enum(["open", "accepted", "declined", "fixed"]), resolution: z.string().trim().max(500).optional() }),
]);

export const PATCH = api(async (req: Request) => {
  const u = await requireRole("editor", "admin");
  const b = Body.parse(await req.json());
  if (b.type === "question") await q("update questions set status=$2 where id=$1", [b.id, b.status]);
  else await q("update reports set status=$2, resolution=$3 where id=$1", [b.id, b.status, b.resolution ?? null]);
  await audit(u.email, `moderate.${b.type}`, String(b.id), b);
  return { ok: true };
}, { db: true });
