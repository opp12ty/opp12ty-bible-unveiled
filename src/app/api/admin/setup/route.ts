import crypto from "node:crypto";
import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, audit, createSession, hashPassword, passwordProblem, rateLimit } from "@/server/auth";
import { one, q } from "@/server/db";

const Body = z.object({
  token: z.string().min(1).max(200),
  email: z.string().email().max(200),
  name: z.string().trim().max(80).default(""),
  password: z.string().min(1).max(200),
});

const safeEq = (a: string, b: string) => {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
};

/** First-run administrator creation. The person chooses their own password; the token only proves they control the deployment. */
export const POST = api(async (req: Request) => {
  await rateLimit("admin-setup", 6, 15 * 60_000);
  const expected = process.env.SETUP_TOKEN;
  if (!expected) throw new HttpError(503, "SETUP_TOKEN is not configured on this deployment.");
  const b = Body.parse(await req.json());
  if (!safeEq(b.token, expected)) throw new HttpError(403, "That setup token is not correct.");
  const existing = await one<{ n: string }>("select count(*)::text as n from users where role='admin'");
  if (existing && Number(existing.n) > 0) throw new HttpError(409, "An administrator already exists. Sign in instead.");
  const problem = passwordProblem(b.password);
  if (problem) throw new HttpError(400, problem);
  const email = b.email.trim().toLowerCase();
  const hash = hashPassword(b.password);
  const [u] = await q<{ id: string }>(
    `insert into users (email, name, pw_hash, role) values ($1,$2,$3,'admin')
     on conflict (email) do update set role='admin', pw_hash=excluded.pw_hash returning id`, [email, b.name, hash]);
  await createSession(u.id);
  await audit(email, "admin.setup");
  return { ok: true };
}, { db: true });
