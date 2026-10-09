"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { useJourney } from "@/lib/journey";

export interface WWCard { k: string; title: string; question: string; steps: { label: string; text: string }[] }

export function WaitWhat({ cards }: { cards: WWCard[] }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const { reveal } = useJourney();
  const c = cards[i];
  return (
    <div className="grid gap-4 max-w-2xl">
      <div className="card p-6">
        <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--violet)" }}>Wait… what? · {i + 1}/{cards.length}</div>
        <p className="serif text-2xl m-0 mt-2">{c.question}</p>
      </div>
      {c.steps.slice(0, shown).map((s) => (
        <div key={s.label} className="card p-4 reveal"><div className="text-xs uppercase tracking-widest muted">{s.label}</div><p className="m-0 mt-1">{s.text}</p></div>
      ))}
      <div className="flex flex-wrap gap-2">
        {shown < c.steps.length ? (
          <button className="neon neon-violet" onClick={() => { setShown(shown + 1); if (shown === 0) reveal("ww:" + c.k); }}><Eye size={16} />Reveal: {c.steps[shown].label}</button>
        ) : (
          <Link className="neon neon-gold no-underline" href={"/" + c.k}>Investigate this <ArrowRight size={14} /></Link>
        )}
        <button className="neon neon-ghost" onClick={() => { setI((i + 1) % cards.length); setShown(0); }}>Next surprise</button>
      </div>
      <p className="muted text-xs m-0">Each card is a researched finding, with its uncertainty stated in the last reveal. No clickbait: what the headline promises is what the evidence delivers.</p>
    </div>
  );
}
