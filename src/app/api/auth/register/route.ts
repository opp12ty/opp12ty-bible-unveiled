import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, createSession, hashPassword, passwordProblem, rateLimit, audit } from "@/server/auth";
import { one, q } from "@/server/db";
import { getSettings } from "@/server/settings";

const Body = z.object({ email: z.string().email().max(200), name: z.string().trim().max(80).default(""), password: z.string().min(1).max(200) });

export const POST = api(async (req: Request) => {
  await rateLimit("register", 8, 15 * 60_000);
  if (!(await getSettings()).flags.signups) throw new HttpError(403, "Sign-ups are currently closed.");
  const b = Body.parse(await req.json());
  const problem = passwordProblem(b.password);
  if (problem) throw new HttpError(400, problem);
  const email = b.email.trim().toLowerCase();
  if (await one("select 1 from users where email=$1", [email])) throw new HttpError(409, "An account with this email already exists. Try signing in.");
  const [u] = await q<{ id: string }>("insert into users (email, name, pw_hash) values ($1,$2,$3) returning id", [email, b.name, hashPassword(b.password)]);
  await createSession(u.id);
  await audit(email, "user.register");
  return { ok: true };
}, { db: true });
