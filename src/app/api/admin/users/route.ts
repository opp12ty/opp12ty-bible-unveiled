import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, audit, requireRole } from "@/server/auth";
import { q } from "@/server/db";

const Body = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "editor", "admin"]).optional(),
  plan: z.enum(["free", "premium", "institution"]).optional(),
  disabled: z.boolean().optional(),
});

export const PATCH = api(async (req: Request) => {
  const me = await requireRole("admin");
  const b = Body.parse(await req.json());
  if (b.id === me.id && (b.role && b.role !== "admin" || b.disabled)) throw new HttpError(400, "You cannot demote or disable your own account.");
  if (b.role) await q("update users set role=$2 where id=$1", [b.id, b.role]);
  if (b.plan) await q("update users set plan=$2 where id=$1", [b.id, b.plan]);
  if (b.disabled !== undefined) {
    await q("update users set disabled=$2 where id=$1", [b.id, b.disabled]);
    if (b.disabled) await q("delete from sessions where user_id=$1", [b.id]);
  }
  await audit(me.email, "user.update", b.id, b);
  return { ok: true };
}, { db: true });
