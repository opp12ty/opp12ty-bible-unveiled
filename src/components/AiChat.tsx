"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useJourney } from "@/lib/journey";
import { track } from "./bits";

interface Out {
  generated: boolean;
  notice: string;
  answer?: string;
  context: { n: number; id: string; title: string; href: string; excerpt?: string }[];
  scripture: string[];
  sources: { id: string; title: string; author: string; year?: string }[];
}

const MODES = [
  ["ask", "Ask anything"], ["investigate", "Investigate a mystery"], ["passage", "Explain a passage"], ["compare", "Compare interpretations"],
  ["language", "Explore original languages"], ["context", "Examine historical context"], ["quiz", "Generate a quiz"],
] as const;

function Inner() {
  const sp = useSearchParams();
  const { s } = useJourney();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("ask");
  const [out, setOut] = useState<Out | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function ask() {
    setBusy(true); setErr(""); setOut(null);
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q, audience: s.audience, depth: s.depth, mode }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Request failed");
      setOut(j); track("ai_ask");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    <div className="wrap py-8 max-w-4xl">
      <h1 className="m-0 text-4xl flex items-center gap-3"><Sparkles style={{ color: "var(--blue)" }} />Unveiled AI</h1>
      <p className="muted max-w-2xl mt-2">A research assistant that answers only from this platform&apos;s reviewed material and the Scripture text, with citations you can open. It can be wrong: check the linked pages.</p>
      <div className="card p-4 grid gap-3 my-5">
        <div><label htmlFor="aq">Your question</label><textarea id="aq" value={q} onChange={(e) => setQ(e.target.value)} maxLength={500} placeholder="e.g. Why do manuscripts disagree about Goliath's height?" /></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label htmlFor="mode">Mode</label><select id="mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>{MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="sm:col-span-2 muted text-sm self-end">Explanation level: <b>{s.audience}</b> · depth <b>{s.depth}/10</b> <Link href="/journey#preferences">change</Link></div>
        </div>
        <div><button className="neon neon-blue" disabled={busy || q.trim().length < 4} onClick={ask}><Sparkles size={16} />{busy ? "Investigating…" : "Ask Unveiled AI"}</button></div>
      </div>
      {err && <div role="alert" className="card p-4" style={{ borderColor: "var(--red)" }}>{err}</div>}
      {out && (
        <div className="grid gap-4 reveal" aria-live="polite">
          <div className="card p-4 flex gap-3" style={{ borderColor: out.generated ? "var(--blue)" : "var(--amber)" }}>
            <AlertTriangle size={20} aria-hidden style={{ color: out.generated ? "var(--blue)" : "var(--amber)", flex: "none" }} />
            <div><b>{out.generated ? "AI-generated summary" : "Research brief (not AI-generated)"}</b><p className="m-0 text-sm">{out.notice}</p></div>
          </div>
          {out.answer && <div className="parchment p-5 whitespace-pre-wrap">{out.answer}</div>}
          {out.context.length > 0 ? (
            <section><h2 className="text-xl m-0 mb-2">Material used</h2>
              <ol className="grid gap-2 list-none p-0 m-0">{out.context.map((c) => (
                <li key={c.id} className="card p-3"><b>[{c.n}] <Link href={c.href}>{c.title}</Link></b>{c.excerpt && <p className="m-0 mt-1 text-sm muted">{c.excerpt}…</p>}</li>
              ))}</ol>
            </section>
          ) : <div className="card p-4">Nothing in the platform&apos;s material matched this question, so there is nothing reliable to summarise. Try different keywords, or <Link href={`/search?q=${encodeURIComponent(q)}`}>search directly</Link>.</div>}
          {out.scripture.length > 0 && <section><h2 className="text-xl m-0 mb-2">Scripture retrieved</h2><ul className="m-0 pl-5 text-sm grid gap-1">{out.scripture.map((l) => <li key={l}>{l}</li>)}</ul></section>}
          {out.sources.length > 0 && <section><h2 className="text-xl m-0 mb-2">Sources behind this material</h2><ul className="m-0 pl-5 text-sm grid gap-1">{out.sources.map((s2) => <li key={s2.id}>{s2.title} — {s2.author}{s2.year ? ` (${s2.year})` : ""}</li>)}</ul></section>}
        </div>
      )}
      <p className="muted text-xs mt-8">Unveiled AI never fabricates sources, quotations, manuscripts or definitions, and cannot replace specialist review. Read <Link href="/method">how AI is used here</Link>.</p>
    </div>
  );
}

export function AiChat() { return <Suspense fallback={null}><Inner /></Suspense>; }
