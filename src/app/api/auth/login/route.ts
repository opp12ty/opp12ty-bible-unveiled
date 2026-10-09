import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, createSession, rateLimit, verifyPassword, audit } from "@/server/auth";
import { one } from "@/server/db";

const Body = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export const POST = api(async (req: Request) => {
  await rateLimit("login", 10, 15 * 60_000);
  const b = Body.parse(await req.json());
  const u = await one<{ id: string; pw_hash: string; disabled: boolean; role: string }>(
    "select id, pw_hash, disabled, role from users where email=$1", [b.email.trim().toLowerCase()]);
  // same message for unknown email and wrong password
  if (!u || u.disabled || !verifyPassword(b.password, u.pw_hash)) throw new HttpError(401, "Email or password is not correct.");
  await createSession(u.id);
  await audit(b.email, "user.login");
  return { ok: true, role: u.role };
}, { db: true });
