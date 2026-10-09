import { z } from "zod";
import { api } from "@/server/http";
import { audit, requireRole } from "@/server/auth";
import { saveSetting } from "@/server/settings";
import { get } from "@/content";

const Home = z.object({
  title: z.string().trim().min(3).max(160),
  subtitle: z.string().trim().max(300),
  announcement: z.string().trim().max(240),
  featured: z.array(z.string()).max(6).refine((a) => a.every((k) => get(k)), "Unknown featured entry"),
});
const Nav = z.object({ hidden: z.array(z.string().max(60)).max(40) });
const Flags = z.object({ ai: z.boolean(), community: z.boolean(), vault: z.boolean(), signups: z.boolean(), payments: z.boolean() });
const Plans = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]{2,24}$/),
  name: z.string().trim().min(2).max(60),
  price: z.string().trim().max(40),
  blurb: z.string().trim().max(300),
  features: z.array(z.string().trim().max(120)).max(10),
})).max(6);

const Body = z.discriminatedUnion("key", [
  z.object({ key: z.literal("home"), value: Home }),
  z.object({ key: z.literal("nav"), value: Nav }),
  z.object({ key: z.literal("flags"), value: Flags }),
  z.object({ key: z.literal("plans"), value: Plans }),
]);

export const PUT = api(async (req: Request) => {
  const u = await requireRole("admin");
  const b = Body.parse(await req.json());
  await saveSetting(b.key, b.value, u.email);
  await audit(u.email, "settings.update", b.key, b.value);
  return { ok: true };
}, { db: true });
