"use client";
import { useState } from "react";
import { Lightbulb, Eye } from "lucide-react";
import type { ObjectItem } from "@/content/types";
import { useJourney } from "@/lib/journey";

const SHAPES: Record<string, React.ReactNode> = {
  lamp: <path d="M14 38c0-8 8-12 20-12 8 0 14 4 18 8l8-2-3 8c-3 6-10 8-20 8s-23-2-23-10zM30 22l4-8" />,
  stone: <circle cx="32" cy="32" r="16" />,
  coin: <><circle cx="32" cy="32" r="18" /><path d="M32 20v24M24 28h16" /></>,
  weight: <path d="M16 44h32l-4-18H20z" />,
  jar: <path d="M22 12h20v8c8 4 10 10 10 18 0 10-8 14-20 14s-20-4-20-14c0-8 2-14 10-18z" />,
  sherd: <path d="M10 22l24-8 22 14-6 20-24 6-14-16z" />,
  box: <><rect x="10" y="22" width="44" height="22" rx="3" /><path d="M10 30h44" /></>,
  ring: <><circle cx="32" cy="32" r="18" /><circle cx="32" cy="32" r="7" /></>,
};

export function ObjectGame({ o }: { o: ObjectItem }) {
  const { reveal, s } = useJourney();
  const id = "obj:" + o.slug;
  const [hints, setHints] = useState(0);
  const [guess, setGuess] = useState("");
  const [shown, setShown] = useState(s.revealed.includes(id));
  const close = guess.trim().length > 2 && o.answer.toLowerCase().includes(guess.trim().toLowerCase().replace(/^an? /, ""));

  return (
    <div className="grid gap-5">
      <div className="card p-5 grid gap-5 md:grid-cols-[220px_1fr] items-center">
        <svg viewBox="0 0 64 64" width="100%" height="180" role="img" aria-label="Schematic outline of the object" fill="rgba(217,173,75,.12)" stroke="var(--gold)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
          {SHAPES[o.glyph] ?? SHAPES.stone}
        </svg>
        <div>
          <div className="text-xs uppercase tracking-widest muted">What is this?</div>
          <p className="serif text-2xl m-0 mt-1">{o.prompt}</p>
          <p className="muted text-xs mt-2 mb-0">Outline is a schematic, not a photograph of a specific artefact.</p>
        </div>
      </div>

      {!shown && (
        <div className="card p-5 grid gap-3">
          <label htmlFor="guess">Your guess</label>
          <input id="guess" type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="What do you think it is?" />
          {close && <p role="status" className="m-0" style={{ color: "var(--emerald)" }}>That looks right. Reveal to see the evidence.</p>}
          <div className="flex gap-2 flex-wrap">
            <button className="neon neon-amber neon-sm" disabled={hints >= o.hints.length} onClick={() => setHints(hints + 1)}><Lightbulb size={16} />Hint {hints}/{o.hints.length}</button>
            <button className="neon neon-emerald" onClick={() => { setShown(true); reveal(id); }}><Eye size={16} />Examine the evidence</button>
          </div>
          {hints > 0 && <ul className="m-0 pl-5">{o.hints.slice(0, hints).map((h) => <li key={h}>{h}</li>)}</ul>}
        </div>
      )}

      {shown && (
        <div className="grid gap-3 reveal">
          <div className="card p-5" style={{ borderColor: "var(--emerald)" }}><div className="text-xs uppercase tracking-widest muted">Answer</div><p className="serif text-2xl m-0">{o.answer}</p></div>
          <dl className="card p-4 grid gap-3 sm:grid-cols-2 m-0">
            {([["Function", o.function], ["Material", o.material], ["Period", o.period], ["Evidence", o.evidence], ["Biblical connection", o.bible ?? "None established"]] as const).map(([k, v]) => (
              <div key={k}><dt className="text-xs uppercase tracking-widest muted">{k}</dt><dd className="m-0">{v}</dd></div>
            ))}
          </dl>
          <div className="card p-4" style={{ borderColor: "rgba(174,149,255,.5)" }}><h3 className="m-0 text-base">What is uncertain</h3><p className="m-0 mt-1">{o.uncertainty}</p></div>
        </div>
      )}
    </div>
  );
}
