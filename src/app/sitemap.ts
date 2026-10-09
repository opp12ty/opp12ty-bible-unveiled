import type { MetadataRoute } from "next";
import { ALL, key } from "@/content";
import { BOOKS } from "@/core/bible";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://bible-unveiled.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/explore", "/investigations", "/oddity-vault", "/belief-check", "/interpretations", "/silence", "/archaeology", "/manuscripts",
    "/objects", "/people", "/places", "/ancient-world", "/map", "/timeline", "/graph", "/bible", "/bible/strongs", "/evidence-lab", "/sources", "/method",
    "/journeys", "/quizzes", "/wait-what", "/surprise", "/pricing", "/help", "/ai", "/questions", "/vault"];
  return [
    ...fixed.map((p) => ({ url: SITE + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...ALL.filter((e) => !e.premium).map((e) => ({ url: `${SITE}/${key(e)}`, changeFrequency: "monthly" as const, priority: e.kind === "investigations" ? 0.9 : 0.6 })),
    ...BOOKS.map((b) => ({ url: `${SITE}/bible/${b.slug}`, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
