import { z } from "zod";
import { api } from "@/server/http";
import { hasDb, q } from "@/server/db";
import { rateLimit } from "@/server/auth";

/** Privacy-conscious analytics: only an event name and a day counter. No identifiers, IPs or content. */
const NAMES = ["view", "search", "search_empty", "investigation_start", "quiz_done", "ai_ask", "save", "surprise", "share"] as const;
const Body = z.object({ name: z.enum(NAMES) });

export const POST = api(async (req: Request) => {
  if (!hasDb()) return { ok: true };
  await rateLimit("event", 120, 60_000);
  const b = Body.parse(await req.json());
  await q(
    `insert into events (day, name, n) values (current_date, $1, 1)
     on conflict (day, name) do update set n = events.n + 1`, [b.name]);
  return { ok: true };
});
