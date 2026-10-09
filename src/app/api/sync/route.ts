import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, currentUser } from "@/server/auth";
import { one, q } from "@/server/db";

export const GET = api(async () => {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "Sign in required");
  const row = await one<{ data: unknown }>("select data from user_state where user_id=$1", [u.id]);
  return { state: row?.data ?? null };
}, { db: true });

const Put = z.object({ state: z.record(z.string(), z.unknown()) });

export const PUT = api(async (req: Request) => {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "Sign in required");
  const text = await req.text();
  if (text.length > 400_000) throw new HttpError(413, "Your saved data is too large to sync.");
  const b = Put.parse(JSON.parse(text));
  await q(
    `insert into user_state (user_id, data) values ($1,$2)
     on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
    [u.id, JSON.stringify(b.state)],
  );
  return { ok: true };
}, { db: true });
