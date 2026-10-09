import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, clientIp, currentUser, rateLimit, sha } from "@/server/auth";
import { q } from "@/server/db";
import { getSettings } from "@/server/settings";

export const GET = api(async () => {
  const rows = await q<{ id: number; text: string; topic: string; votes: number; status: string; created_at: string }>(
    "select id, text, topic, votes, status, created_at from questions where status in ('approved','researching','answered') order by votes desc, created_at desc limit 100");
  return { questions: rows };
}, { db: true });

const Post = z.object({ text: z.string().trim().min(12).max(400), topic: z.string().trim().max(40).default("general") });
const Vote = z.object({ id: z.number().int().positive() });

export const POST = api(async (req: Request) => {
  await rateLimit("question", 5, 60 * 60_000);
  if (!(await getSettings()).flags.community) throw new HttpError(403, "The community board is currently closed.");
  const b = Post.parse(await req.json());
  const u = await currentUser();
  await q("insert into questions (user_id, text, topic) values ($1,$2,$3)", [u?.id ?? null, b.text, b.topic]);
  return { ok: true, message: "Thank you. Your question will appear after moderation." };
}, { db: true });

export const PUT = api(async (req: Request) => {
  await rateLimit("vote", 60, 60 * 60_000);
  const b = Vote.parse(await req.json());
  const u = await currentUser();
  const voter = u ? `u:${u.id}` : `ip:${sha(await clientIp()).slice(0, 24)}`;
  const ins = await q("insert into question_votes (question_id, voter) values ($1,$2) on conflict do nothing returning 1", [b.id, voter]);
  if (ins.length) await q("update questions set votes = votes + 1 where id=$1", [b.id]);
  return { ok: true, counted: ins.length > 0 };
}, { db: true });
