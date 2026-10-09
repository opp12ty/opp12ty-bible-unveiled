import { z } from "zod";
import { api } from "@/server/http";
import { HttpError, rateLimit } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { get, key, search, source, type Entry } from "@/content";
import { concordance, resolveRef } from "@/server/bible";
import { BOOKS } from "@/core/bible";

const Body = z.object({
  question: z.string().trim().min(4).max(500),
  audience: z.enum(["child", "teen", "beginner", "adult", "advanced", "researcher"]).default("adult"),
  depth: z.number().int().min(1).max(10).default(4),
  mode: z.enum(["ask", "investigate", "passage", "compare", "language", "context", "quiz"]).default("ask"),
});

interface Ctx { n: number; id: string; title: string; href: string; text: string }

/** Compact, citable text for an entry: only what the editors wrote, with its stated uncertainty. */
function digest(e: Entry): string {
  const parts: string[] = [e.title + ". " + e.summary];
  switch (e.kind) {
    case "investigations":
      for (const l of e.layers.filter((x) => x.depth <= 6)) parts.push(l.heading + ": " + l.body.join(" "));
      for (const c of e.claims) parts.push(`Claim (${c.status}): ${c.text} Limits: ${c.limits}`);
      if (e.unresolved.length) parts.push("Unresolved: " + e.unresolved.join(" "));
      break;
    case "oddity-vault": parts.push(...e.explanation, e.context, "Evidence: " + e.evidence, "Uncertainty: " + e.uncertainties); break;
    case "belief-check": parts.push(`Verdict: ${e.verdict}. ${e.why}`, ...e.text); break;
    case "interpretations": for (const p of e.positions) parts.push(`${p.label}: ${p.position}`); break;
    case "silence": parts.push("Says: " + e.says.join(" "), "Unknown: " + e.unknown.join(" ")); break;
    case "archaeology": parts.push("Found: " + e.found, "Dating: " + e.dating, "Inference: " + e.inference, "Connection: " + e.connection + ". " + e.connectionNote, "Limits: " + e.limits); break;
    case "manuscripts": parts.push(`Composed: ${e.composed}. Copied: ${e.copied}. ${e.why} Limits: ${e.limits}`); break;
    case "people": parts.push(...e.body, "Outside the Bible: " + e.outside); break;
    case "places": parts.push(...e.body, `Identification: ${e.location}.`); break;
    case "ancient-world": parts.push(...e.body, "Direct evidence: " + e.directEvidence, "Caution: " + e.cautions); break;
    case "objects": parts.push(`${e.answer}. ${e.function} Evidence: ${e.evidence} Uncertainty: ${e.uncertainty}`); break;
  }
  return parts.join(" ").slice(0, 1800);
}

function retrieve(question: string, extraKeys: string[] = []): Ctx[] {
  const found = new Map<string, Entry>();
  for (const k of extraKeys) { const e = get(k); if (e) found.set(k, e); }
  const words = question.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter((w) => w.length > 3);
  // search with the whole question, then with each salient word, to cope with natural-language phrasing
  for (const e of search(question, undefined, 5)) found.set(key(e), e);
  if (found.size < 2) for (const w of words) for (const e of search(w, undefined, 3)) if (found.size < 7) found.set(key(e), e);
  return [...found.entries()].slice(0, 6).map(([k, e], i) => ({ n: i + 1, id: k, title: e.title, href: "/" + k, text: digest(e) }));
}

const SYSTEM = `You are Unveiled AI, the research assistant of BIBLE UNVEILED, an educational platform for investigating the Bible and the ancient world.
Rules:
- Answer ONLY from the numbered CONTEXT and the SCRIPTURE lines supplied. If the context does not contain the answer, say you cannot verify it from the platform's material and suggest what to look at next.
- Cite context items inline like [1], [2]. Never invent sources, quotations, manuscripts, inscriptions, dates, Hebrew or Greek definitions.
- Separate clearly: what the text says; historical or archaeological evidence; scholarly interpretation; religious tradition; hypotheses; what is unknown.
- Represent interpretive disagreements fairly. Do not give numeric "truth" scores.
- Match the requested audience level and depth (1 = simplest, 10 = research-level). Keep the underlying evidence unchanged.
- End with a one-line reminder that this is an AI-generated summary and the cited pages should be checked.`;

export const POST = api(async (req: Request) => {
  await rateLimit("ai", 12, 60_000);
  if (!(await getSettings()).flags.ai) throw new HttpError(403, "Unveiled AI is currently switched off.");
  const b = Body.parse(await req.json());

  const ref = resolveRef(b.question);
  const verseCtx = ref ? ref.verses.slice(0, 8).map((v) => `${ref.label.split(":")[0]}:${v.v} — ${v.text}`) : [];
  const ctx = retrieve(b.question);
  const lines: string[] = [...verseCtx];
  if (!ref && b.question.length > 4) {
    const c = concordance("kjv", b.question.replace(/\?/g, ""), { limit: 3 });
    for (const v of c.items) lines.push(`${BOOKS[v.b].name} ${v.c}:${v.v} (KJV) — ${v.text}`);
  }
  const sources = [...new Set(ctx.flatMap((c) => get(c.id)?.sources ?? []))].map((id) => source(id)).filter(Boolean).slice(0, 8);

  const keyEnv = process.env.ANTHROPIC_API_KEY;
  if (!keyEnv) {
    return {
      generated: false,
      mode: "research-brief",
      notice: "Generated answers are not enabled on this deployment, so this is a research brief assembled from the platform's reviewed material. Nothing below was written by an AI model.",
      context: ctx.map(({ n, id, title, href, text }) => ({ n, id, title, href, excerpt: text.slice(0, 420) })),
      scripture: lines,
      sources: sources.map((s) => ({ id: s!.id, title: s!.title, author: s!.author, year: s!.year })),
    };
  }

  const prompt = [
    `AUDIENCE: ${b.audience}. DEPTH: ${b.depth}/10. MODE: ${b.mode}.`,
    "CONTEXT:",
    ...ctx.map((c) => `[${c.n}] (${c.title}) ${c.text}`),
    "SCRIPTURE:",
    ...(lines.length ? lines : ["(none retrieved)"]),
    `QUESTION: ${b.question}`,
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": keyEnv, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: 900, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    console.error("anthropic error", res.status);
    throw new HttpError(502, "The AI service did not respond. The research brief is still available — please try again in a moment.");
  }
  const j = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (j.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
  return {
    generated: true,
    mode: "ai-answer",
    notice: "AI-generated summary of the cited platform material. Verify against the linked pages.",
    answer: text,
    context: ctx.map(({ n, id, title, href }) => ({ n, id, title, href })),
    scripture: lines,
    sources: sources.map((s) => ({ id: s!.id, title: s!.title, author: s!.author, year: s!.year })),
  };
});
