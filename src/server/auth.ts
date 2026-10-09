import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { hasDb, one, q } from "./db";

export type Role = "user" | "editor" | "admin";
export interface SessionUser { id: string; email: string; name: string; role: Role; plan: string }

const COOKIE = "ub_session";
const DAYS = 30;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/* ---- password hashing: scrypt with a per-user salt; parameters are stored in the hash ---- */
const N = 16384, R = 8, P = 1, LEN = 64;
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${h.toString("base64")}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !hash) return false;
  const expect = Buffer.from(hash, "base64");
  const got = crypto.scryptSync(pw, Buffer.from(salt, "base64"), expect.length, { N: Number(n), r: Number(r), p: Number(p) });
  return got.length === expect.length && crypto.timingSafeEqual(got, expect);
}

export const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Include letters and numbers.";
  return null;
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + DAYS * 86_400_000);
  await q("insert into sessions (user_id, token_hash, expires_at) values ($1,$2,$3)", [userId, sha(token), expires]);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires });
}

export async function destroySession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t && hasDb()) await q("delete from sessions where token_hash=$1", [sha(t)]);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<SessionUser | null> {
  if (!hasDb()) return null;
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (!t) return null;
  const row = await one<SessionUser & { disabled: boolean }>(
    `select u.id, u.email, u.name, u.role, u.plan, u.disabled from sessions s join users u on u.id = s.user_id
     where s.token_hash=$1 and s.expires_at > now()`, [sha(t)]);
  if (!row || row.disabled) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, plan: row.plan };
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const u = await currentUser();
  if (!u || !roles.includes(u.role)) throw new HttpError(u ? 403 : 401, u ? "Forbidden" : "Sign in required");
  return u;
}

/* ---- tiny in-memory rate limiter (per server instance; documented limitation) ---- */
const hits = new Map<string, { n: number; reset: number }>();
export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
}
export async function rateLimit(name: string, max: number, windowMs: number) {
  const key = `${name}:${await clientIp()}`;
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || cur.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return; }
  cur.n++;
  if (cur.n > max) throw new HttpError(429, "Too many requests. Please wait a moment and try again.");
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
}

export async function audit(actor: string | null, action: string, target?: string, detail?: unknown) {
  if (!hasDb()) return;
  await q("insert into audit (actor, action, target, detail) values ($1,$2,$3,$4)", [actor, action, target ?? null, detail ? JSON.stringify(detail) : null]);
}
