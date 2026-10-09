"use client";
import { useEffect, useState } from "react";
import { BookOpenText, ChevronDown, Eye, Layers, ScrollText } from "lucide-react";
import type { Claim, Investigation, QuizQ } from "@/content/types";
import { useJourney } from "@/lib/journey";
import { EvidenceBadge, StatusBadge } from "./ui";
import { NoteBox, track } from "./bits";

const AUDIENCE_DEPTH = { child: 2, teen: 3, beginner: 3, adult: 5, advanced: 7, researcher: 10 } as const;
const DEPTH_NAMES = ["", "Simple explanation", "Basic background", "Important details", "Contextual exploration", "Related passages and history", "Evidence comparison", "Scholarly perspectives", "Advanced research", "Detailed source analysis", "Research-level"];

export function Quiz({ k, questions, onDone }: { k: string; questions: QuizQ[]; onDone?: () => void }) {
  const { recordQuiz, s } = useJourney();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [finished, setFinished] = useState(false);
  const prev = s.quiz[k];
  const score = picked.reduce<number>((n, p, i) => n + (p === questions[i].answer ? 1 : 0), 0);
  return (
    <section aria-labelledby={"quiz-" + k} className="card p-5">
      <h2 id={"quiz-" + k} className="m-0 text-xl">Test your knowledge</h2>
      {prev && <p className="muted text-sm m-0 mt-1">Your best score: {prev.score}/{prev.total}</p>}
      <div className="grid gap-5 mt-4">
        {questions.map((q, i) => (
          <fieldset key={i} className="border-0 p-0 m-0">
            <legend className="font-semibold mb-2">{i + 1}. {q.q}</legend>
            <div className="grid gap-2">
              {q.options.map((o, j) => {
                const chosen = picked[i] === j;
                const show = picked[i] !== null;
                const right = j === q.answer;
                return (
                  <button key={j} disabled={show} className="text-left card px-3 py-2 cursor-pointer" aria-pressed={chosen}
                    style={{ borderColor: show && right ? "var(--emerald)" : chosen ? "var(--red)" : undefined, opacity: show && !chosen && !right ? 0.65 : 1 }}
                    onClick={() => { const n = [...picked]; n[i] = j; setPicked(n); }}>
                    {o}{show && right ? " ✓ correct" : chosen ? " ✗ not quite" : ""}
                  </button>
                );
              })}
            </div>
            {picked[i] !== null && <p className="muted text-sm mt-2 mb-0">{q.why}</p>}
          </fieldset>
        ))}
      </div>
      {!finished ? (
        <button className="neon neon-emerald mt-5" disabled={picked.some((p) => p === null)} onClick={() => { setFinished(true); recordQuiz(k, score, questions.length); track("quiz_done"); onDone?.(); }}>
          Finish and record result
        </button>
      ) : (
        <p className="mt-4 mb-0" role="status"><b>You scored {score} of {questions.length}.</b> Recorded in My Journey. Scores reflect learning progress, not belief.</p>
      )}
    </section>
  );
}

function ClaimRow({ c, sourceTitles }: { c: Claim; sourceTitles: Record<string, string> }) {
  return (
    <li className="card p-4 grid gap-2">
      <div className="font-semibold">{c.text}</div>
      <div className="flex flex-wrap gap-2"><EvidenceBadge k={c.kind} /><StatusBadge s={c.status} /></div>
      <div className="text-sm"><span className="muted">Limits: </span>{c.limits}</div>
      <div className="text-xs muted">Sources: {c.sources.map((s) => sourceTitles[s] ?? s).join("; ")}</div>
    </li>
  );
}

export function InvestigationReader({ inv, sourceTitles, base }: { inv: Investigation; sourceTitles: Record<string, string>; base: string }) {
  const { s, set, ready, award } = useJourney();
  const [depth, setDepth] = useState(5);
  const [immersive, setImmersive] = useState(false);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  useEffect(() => { if (ready) { setDepth(s.depth); setImmersive(s.immersive); } }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) track("investigation_start"); }, [ready]);

  const layers = inv.layers.filter((l) => l.depth <= depth);
  const hidden = inv.layers.length - layers.length;
  const k = base;

  return (
    <div className="grid gap-6">
      <section className="card p-4 grid gap-4" aria-label="Reading controls">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <div>
            <label htmlFor="depth" className="flex justify-between"><span><Layers size={14} className="inline -mt-0.5" /> Knowledge depth: <b style={{ color: "var(--gold-soft)" }}>{depth}/10 · {DEPTH_NAMES[depth]}</b></span></label>
            <input id="depth" type="range" min={1} max={10} value={depth} aria-valuetext={`${depth} of 10, ${DEPTH_NAMES[depth]}`}
              onChange={(e) => { const d = Number(e.target.value); setDepth(d); set({ depth: d }); }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className="sr-only" htmlFor="aud">Explanation level</label>
            <select id="aud" value={s.audience} style={{ width: "auto" }} onChange={(e) => { const a = e.target.value as keyof typeof AUDIENCE_DEPTH; set({ audience: a, depth: AUDIENCE_DEPTH[a] }); setDepth(AUDIENCE_DEPTH[a]); }}>
              <option value="child">Child</option><option value="teen">Teen</option><option value="beginner">Beginner</option>
              <option value="adult">Adult</option><option value="advanced">Advanced student</option><option value="researcher">Researcher</option>
            </select>
            <button className="neon neon-ghost neon-sm" aria-pressed={immersive} onClick={() => { setImmersive(!immersive); set({ immersive: !immersive }); }}>
              {immersive ? <ScrollText size={16} /> : <Eye size={16} />}{immersive ? "Text-first layout" : "Immersive layout"}
            </button>
          </div>
        </div>
        <p className="muted text-xs m-0">Depth changes how much detail is shown, never what the evidence says. {hidden > 0 && `${hidden} deeper layer${hidden > 1 ? "s" : ""} hidden at this depth.`}</p>
      </section>

      <article className={immersive ? "parchment p-5 sm:p-8" : "card p-5 sm:p-7"}>
        <h2 className="m-0 text-2xl mb-1"><BookOpenText className="inline -mt-1 mr-2" size={22} />Case file</h2>
        <div className="grid gap-4 mt-4">
          {layers.map((l) => (
            <section key={l.depth + l.heading} className="reveal">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-xl">{l.heading}</h3>
                {l.tag && <EvidenceBadge k={l.tag} />}
                <span className="chip">Depth {l.depth}</span>
              </div>
              {l.body.map((p, i) => <p key={i} className="m-0 mt-2 max-w-[72ch]">{p}</p>)}
            </section>
          ))}
        </div>
      </article>

      {depth >= 3 && inv.claims.length > 0 && (
        <section aria-labelledby="board">
          <h2 id="board" className="text-2xl m-0 mb-1">Evidence board</h2>
          <p className="muted m-0 mb-3 text-sm">Each claim is classified by kind of evidence and by editorial confidence. There are no truth percentages: confidence words are defined on the <a href="/method">methodology page</a>.</p>
          <ul className="list-none p-0 m-0 grid gap-3 md:grid-cols-2">{inv.claims.map((c, i) => <ClaimRow key={i} c={c} sourceTitles={sourceTitles} />)}</ul>
        </section>
      )}

      {depth >= 5 && inv.viewpoints.length > 0 && (
        <section aria-labelledby="views">
          <h2 id="views" className="text-2xl m-0 mb-3">Compare interpretations</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {inv.viewpoints.map((v, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="m-0 text-lg">{v.label}</h3><span className="chip">{v.nature}</span></div>
                <p className="m-0 mt-2">{v.position}</p>
                <button className="neon neon-ghost neon-sm mt-3" aria-expanded={!!open[i]} onClick={() => setOpen({ ...open, [i]: !open[i] })}><ChevronDown size={14} />Support and objections</button>
                {open[i] && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm reveal">
                    <div><b>Support</b><ul className="m-0 pl-5">{v.support.map((x) => <li key={x}>{x}</li>)}</ul></div>
                    <div><b>Objections</b><ul className="m-0 pl-5">{v.objections.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {inv.unresolved.length > 0 && (
        <section className="card p-5" style={{ borderColor: "rgba(174,149,255,.5)" }} aria-labelledby="unres">
          <h2 id="unres" className="m-0 text-xl" style={{ color: "var(--violet)" }}>What remains unresolved</h2>
          <ul className="m-0 mt-2 pl-5">{inv.unresolved.map((u) => <li key={u}>{u}</li>)}</ul>
        </section>
      )}

      <Quiz k={k} questions={inv.quiz} onDone={() => award("done:" + k, 15)} />

      <section className="card p-5 grid gap-4">
        <h2 className="m-0 text-xl">Your investigation</h2>
        <NoteBox k={k} />
        <ConclusionBox k={k} />
      </section>
    </div>
  );
}

function ConclusionBox({ k }: { k: string }) {
  const { s, set, ready } = useJourney();
  const [v, setV] = useState("");
  useEffect(() => { if (ready) setV(s.conclusions[k] ?? ""); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <label htmlFor={"concl-" + k}>My conclusion so far</label>
      <textarea id={"concl-" + k} value={v} maxLength={2000} onChange={(e) => { setV(e.target.value); set({ conclusions: { ...s.conclusions, [k]: e.target.value } }); }} placeholder="In your own words: what do you think the evidence supports, and what would change your mind?" />
      <p className="muted text-xs m-0 mt-1">Your conclusion is yours. It is not an editorial finding and is never shown to other visitors.</p>
    </div>
  );
}
