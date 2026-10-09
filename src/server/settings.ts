import "server-only";
import { hasDb, q } from "./db";

/** Admin-editable site settings. Defaults apply when the database is absent or a key has never been saved. */
export interface Plan { id: string; name: string; price: string; blurb: string; features: string[] }
export interface SiteSettings {
  home: { title: string; subtitle: string; announcement: string; featured: string[] };
  nav: { hidden: string[] };
  flags: { ai: boolean; community: boolean; vault: boolean; signups: boolean; payments: boolean };
  plans: Plan[];
}

export const DEFAULTS: SiteSettings = {
  home: {
    title: "You don't just read the Bible. You investigate it.",
    subtitle: "Investigate the text. Explore the ancient world. Examine the evidence. Discover what you never noticed.",
    announcement: "",
    featured: ["investigations/goliaths-height", "investigations/the-pilate-stone", "investigations/house-of-david-tel-dan"],
  },
  nav: { hidden: [] },
  flags: { ai: true, community: true, vault: true, signups: true, payments: false },
  plans: [
    { id: "free", name: "Free Explorer", price: "Free", blurb: "Everything on the public site, plus a personal journey saved on your device.", features: ["All investigations marked free", "Oddity Vault, Belief Check, maps, timeline", "Scripture reader with original-language tools", "Unveiled AI research briefs"] },
    { id: "premium", name: "Premium Investigator", price: "To be announced", blurb: "Deeper case files, advanced study tools and expanded AI research.", features: ["Vault investigations", "Advanced study collections", "Expanded Unveiled AI use", "Account sync across devices"] },
    { id: "institution", name: "Institutional Access", price: "Contact us", blurb: "Teacher workspaces, group assignments and progress reports.", features: ["Class groups", "Assignments and quizzes", "Progress reports", "Licensing for schools and colleges"] },
  ],
};

export async function getSettings(): Promise<SiteSettings> {
  if (!hasDb()) return DEFAULTS;
  try {
    const rows = await q<{ key: string; value: unknown }>("select key, value from settings");
    const out: SiteSettings = structuredClone(DEFAULTS);
    for (const r of rows) {
      if (r.key === "home") out.home = { ...out.home, ...(r.value as object) };
      else if (r.key === "nav") out.nav = { ...out.nav, ...(r.value as object) };
      else if (r.key === "flags") out.flags = { ...out.flags, ...(r.value as object) };
      else if (r.key === "plans" && Array.isArray(r.value)) out.plans = r.value as Plan[];
    }
    return out;
  } catch (e) {
    console.error("settings read failed", e);
    return DEFAULTS;
  }
}

export async function saveSetting(key: keyof SiteSettings, value: unknown, by: string) {
  await q(
    `insert into settings (key, value, updated_by) values ($1,$2,$3)
     on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
    [key, JSON.stringify(value), by],
  );
}
