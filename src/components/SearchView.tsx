"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search, Sparkles } from "lucide-react";
import { track } from "./bits";

interface Res {
  content: { k: string; href: string; kind: string; kindLabel: string; title: string; summary: string }[];
  reference: { label: string; href: string; verses: { v: number; text: string }[] } | null;
  verses: { ref: string; href: string; text: string }[];
  total: number;
  lexicon: { id: string; lemma: string; translit: string; gloss: string }[];
}
const KEY = "ub.searches";

export function SearchView() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [res, setRes] = useState<Res | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [kind, setKind] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ } }, []);
  useEffect(() => {
    const term = sp.get("q") ?? "";
    setQ(term);
    if (term.trim().length < 2) { setRes(null); return; }
    let live = true;
    setBusy(true); setErr("");
    fetch(`/api/search?q=${encodeURIComponent(term)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j: Res) => {
        if (!live) return;
        setRes(j); setKind("");
        track(j.content.length + j.verses.length === 0 && !j.reference ? "search_empty" : "search");
        try {
          const next = [term, ...recent.filter((x) => x !== term)].slice(0, 8);
          localStorage.setItem(KEY, JSON.stringify(next)); setRecent(next);
        } catch { /* ignore */ }
      })
      .catch(() => live && setErr("Search is unavailable right now. Check your connection and try again."))
      .finally(() => live && setBusy(false));
    return () => { live = false; };
  }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps

  const kinds = useMemo(() => {
    const m = new Map<string, number>();
    res?.content.forEach((c) => m.set(c.kindLabel, (m.get(c.kindLabel) ?? 0) + 1));
    return [...m.entries()];
  }, [res]);
  const shown = res?.content.filter((c) => !kind || c.kindLabel === kind) ?? [];
  const empty = res && !res.content.length && !res.verses.length && !res.reference && !res.lexicon.length;

  return (
    <div className="wrap py-8 max-w-4xl">
      <h1 className="m-0 text-4xl">Search</h1>
      <p className="muted mt-1">Investigations, people, places, finds, manuscripts, verses and Hebrew/Greek words. Results are matches in our material; none is generated.</p>
      <form role="search" className="flex gap-2 my-5" onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}>
        <label htmlFor="sq" className="sr-only">Search</label>
        <input id="sq" type="search" value={q} autoFocus onChange={(e) => setQ(e.target.value)} placeholder="Try: Goliath, Isaiah 53, tax collector, ketos…" />
        <button className="neon neon-blue" type="submit"><Search size={16} />Search</button>
      </form>

      {!initial && recent.length > 0 && (
        <div className="mb-6"><div className="muted text-sm mb-2"><Clock size={14} className="inline -mt-0.5" /> Recent searches</div>
          <div className="flex gap-2 flex-wrap">{recent.map((r) => <Link key={r} className="chip no-underline" href={`/search?q=${encodeURIComponent(r)}`}>{r}</Link>)}</div></div>
      )}
      {busy && <p role="status" className="muted">Searching…</p>}
      {err && <div className="card p-4" role="alert" style={{ borderColor: "var(--red)" }}>{err}</div>}
      {empty && (
        <div className="card p-6">
          <p className="m-0 font-semibold">No matches for “{initial}”.</p>
          <p className="muted mt-2 mb-3">Try a single keyword, a person&apos;s name, or a reference like “John 3:16”. If you want an answer rather than matches:</p>
          <Link className="neon neon-blue neon-sm no-underline" href={`/ai?q=${encodeURIComponent(initial)}`}><Sparkles size={14} />Ask Unveiled AI</Link>
        </div>
      )}

      {res?.reference && (
        <section className="parchment p-5 mb-5" aria-label="Scripture reference">
          <h2 className="m-0 text-lg">{res.reference.label} (KJV)</h2>
          {res.reference.verses.map((v) => <span key={v.v}><sup>{v.v}</sup> {v.text} </span>)}
          <div className="mt-2"><Link href={res.reference.href}>Read the chapter →</Link></div>
        </section>
      )}

      {kinds.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4" role="group" aria-label="Filter results by type">
          <button className="chip cursor-pointer" aria-pressed={!kind} onClick={() => setKind("")} style={!kind ? { color: "var(--gold-soft)", borderColor: "var(--gold)" } : undefined}>All {res!.content.length}</button>
          {kinds.map(([k, n]) => <button key={k} className="chip cursor-pointer" aria-pressed={kind === k} onClick={() => setKind(kind === k ? "" : k)} style={kind === k ? { color: "var(--gold-soft)", borderColor: "var(--gold)" } : undefined}>{k} {n}</button>)}
        </div>
      )}
      <ul className="list-none p-0 m-0 grid gap-3">
        {shown.map((c) => (
          <li key={c.k}><Link href={c.href} className="card card-hover block no-underline p-4" style={{ color: "var(--text)" }}>
            <span className="chip mr-2">{c.kindLabel}</span><b className="serif text-lg">{c.title}</b><span className="block muted text-sm mt-1">{c.summary}</span>
          </Link></li>
        ))}
      </ul>

      {res && res.lexicon.length > 0 && (
        <section className="mt-8"><h2 className="text-xl m-0 mb-2">Original-language words</h2>
          <div className="flex gap-2 flex-wrap">{res.lexicon.map((l) => <Link key={l.id} className="chip no-underline" href={`/bible/strongs/${l.id}`}>{l.id} {l.lemma} · {l.translit}</Link>)}</div>
        </section>
      )}
      {res && res.verses.length > 0 && (
        <section className="mt-8"><h2 className="text-xl m-0 mb-2">Verses (KJV){res.total > res.verses.length ? ` · ${res.total} total` : ""}</h2>
          <ul className="list-none p-0 m-0 grid gap-2">{res.verses.map((v) => <li key={v.href} className="card p-3"><Link href={v.href} className="font-semibold">{v.ref}</Link><p className="m-0 mt-1 text-sm">{v.text}</p></li>)}</ul>
          <Link className="neon neon-ghost neon-sm no-underline mt-3" href={`/bible/search?q=${encodeURIComponent(initial)}`}>All verse matches</Link>
        </section>
      )}
    </div>
  );
}
