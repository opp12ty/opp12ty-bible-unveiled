"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Dices, X } from "lucide-react";
import { useJourney } from "@/lib/journey";
import { track } from "./bits";

export interface SItem { k: string; title: string; summary: string; kindLabel: string; tags: string[] }
const KEY = "ub.dismissed";

export function Surprise({ items }: { items: SItem[] }) {
  const { s, ready, toggleSave } = useJourney();
  const [cur, setCur] = useState<SItem | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);

  function pick(exclude: string[]) {
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { /* ignore */ }
    const interests = s.interests.map((x) => x.toLowerCase());
    const pool = items.filter((i) => !exclude.includes(i.k) && !dismissed.includes(i.k));
    const unseen = pool.filter((i) => !s.seen.includes(i.k));
    const base = unseen.length ? unseen : pool.length ? pool : items;
    // soft preference for interests, but always leave room for a different topic
    const liked = base.filter((i) => interests.some((t) => i.tags.join(" ").toLowerCase().includes(t.split(" ")[0])));
    const useLiked = liked.length > 0 && Math.random() < 0.6;
    const list = useLiked ? liked : base;
    setCur(list[Math.floor(Math.random() * list.length)] ?? null);
    track("surprise");
  }
  useEffect(() => { if (ready && !cur) pick([]); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss(k: string) {
    try { const d = JSON.parse(localStorage.getItem(KEY) ?? "[]"); localStorage.setItem(KEY, JSON.stringify([...d, k].slice(-60))); } catch { /* ignore */ }
    const next = [...skipped, k]; setSkipped(next); pick(next);
  }

  if (!cur) return <p className="muted">Finding something for you…</p>;
  return (
    <div className="grid gap-4 max-w-2xl">
      <div className="card p-6 reveal" aria-live="polite">
        <span className="chip">{cur.kindLabel}</span>
        <h2 className="serif text-3xl m-0 mt-2">{cur.title}</h2>
        <p className="muted mt-2">{cur.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={"/" + cur.k} className="neon neon-gold no-underline">Investigate this</Link>
          <button className="neon neon-ghost" onClick={() => toggleSave(cur.k)}>{s.saved.includes(cur.k) ? "Saved ✓" : "Save for later"}</button>
          <button className="neon neon-amber" onClick={() => { setSkipped([...skipped, cur.k]); pick([...skipped, cur.k]); }}><Dices size={16} />Another</button>
          <button className="neon neon-ghost" onClick={() => dismiss(cur.k)}><X size={16} />Don&apos;t show again</button>
        </div>
      </div>
      <p className="muted text-xs m-0">Your interests nudge the pick but never narrow it completely. Set or reset them in <Link href="/journey#preferences">My Journey</Link>.</p>
    </div>
  );
}
