import { z } from "zod";
import { api } from "@/server/http";
import { rateLimit } from "@/server/auth";
import { q } from "@/server/db";

const Body = z.object({ path: z.string().max(200), message: z.string().trim().min(10).max(1500), contact: z.string().trim().max(200).optional() });

export const POST = api(async (req: Request) => {
  await rateLimit("report", 6, 60 * 60_000);
  const b = Body.parse(await req.json());
  await q("insert into reports (path, message, contact) values ($1,$2,$3)", [b.path, b.message, b.contact ?? null]);
  return { ok: true, message: "Thank you. Our editors review every report." };
}, { db: true });
