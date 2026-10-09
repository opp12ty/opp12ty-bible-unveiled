"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, LogOut, RotateCcw, Trophy } from "lucide-react";
import { BADGES, LEVELS, levelFor, useJourney } from "@/lib/journey";

const INTERESTS = ["Biblical mysteries", "Ancient history", "Archaeology", "Languages", "Manuscripts", "Daily life", "People", "Geography", "Interpretation", "Textual questions"];

export function JourneyDashboard({ titles }: { titles: Record<string, string> }) {
  const { s, set, reset, account, ready } = useJourney();
  const [confirm, setConfirm] = useState(false);
  if (!ready) return <div className="wrap py-8">Loading your journey…</div>;
  const lvl = levelFor(s.xp);
  const saved = s.saved.filter((k) => !k.startsWith("v:"));
  const verses = s.saved.filter((k) => k.startsWith("v:"));
  const notes = Object.entries(s.notes).filter(([, v]) => v.trim());

  function exportJson() {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bible-unveiled-journey.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.reload(); }

  return (
    <div className="wrap py-8 grid gap-6">
      <header>
        <h1 className="m-0 text-4xl">My Journey</h1>
        <p className="muted mt-1">Progress, notes and saved items. {account ? `Synced to ${account.email}.` : "Stored on this device. Create an account to sync across devices."}</p>
      </header>

      <section className="card p-5 grid gap-3" aria-label="Level">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div><div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>Level {lvl.index + 1}</div><div className="serif text-3xl">{lvl.name}</div></div>
          <div className="text-right"><div className="text-2xl serif">{s.xp} XP</div><div className="muted text-sm">{s.streak.count}-day streak</div></div>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lvl.pct * 100)} aria-label="Progress to next level" className="h-3 rounded-full overflow-hidden" style={{ background: "var(--navy-700)" }}>
          <div style={{ width: `${Math.round(lvl.pct * 100)}%`, height: "100%", background: "linear-gradient(90deg,var(--gold),var(--blue))" }} />
        </div>
        <p className="muted text-sm m-0">{lvl.next ? `${lvl.toNext} XP to ${lvl.next}.` : "Top level reached."} Levels reflect exploration and research habits, not belief or academic standing.</p>
        <div className="flex flex-wrap gap-2 text-xs muted">{LEVELS.map((l) => <span key={l.name} className="chip" style={s.xp >= l.xp ? { color: "var(--gold-soft)" } : undefined}>{l.name} · {l.xp}</span>)}</div>
      </section>

      <section aria-labelledby="badges"><h2 id="badges" className="text-2xl m-0 mb-3 flex items-center gap-2"><Trophy size={20} />Badges</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(BADGES).map(([id, b]) => {
            const got = s.badges.includes(id);
            return <div key={id} className="card p-4" style={{ opacity: got ? 1 : 0.6, borderColor: got ? "var(--gold)" : undefined }}><b>{got ? "★ " : "☆ "}{b.name}</b><div className="muted text-sm">{b.how}</div></div>;
          })}
        </div>
      </section>

      <section aria-labelledby="saved" className="grid gap-3 md:grid-cols-2">
        <div className="card p-5"><h2 id="saved" className="m-0 text-xl">Saved library ({saved.length})</h2>
          {saved.length === 0 ? <p className="muted">Nothing saved yet. Use “Save” on any page.</p> : <ul className="m-0 mt-2 pl-5 grid gap-1">{saved.map((k) => <li key={k}><Link href={"/" + k}>{titles[k] ?? k}</Link></li>)}</ul>}
        </div>
        <div className="card p-5"><h2 className="m-0 text-xl">Highlighted verses ({verses.length})</h2>
          {verses.length === 0 ? <p className="muted">Tap a verse number in the Scripture reader to highlight it.</p> : <ul className="m-0 mt-2 pl-5 grid gap-1">{verses.map((k) => { const [, b, c, v] = k.split(":"); return <li key={k}><Link href={`/bible/${b}/${c}#v${v}`}>{b.replace(/-/g, " ")} {c}:{v}</Link></li>; })}</ul>}
        </div>
      </section>

      <section className="card p-5"><h2 className="m-0 text-xl">Research notes ({notes.length})</h2>
        {notes.length === 0 ? <p className="muted">Notes you write on investigations appear here.</p> : (
          <ul className="list-none p-0 m-0 mt-2 grid gap-3">{notes.map(([k, v]) => <li key={k}><Link href={"/" + k}><b>{titles[k] ?? k}</b></Link><p className="m-0 text-sm whitespace-pre-wrap">{v}</p>{s.conclusions[k] && <p className="m-0 text-sm muted">Conclusion: {s.conclusions[k]}</p>}</li>)}</ul>
        )}
      </section>

      <section id="preferences" className="card p-5 grid gap-4" aria-labelledby="prefs">
        <h2 id="prefs" className="m-0 text-xl">Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="aud">Explanation level</label>
            <select id="aud" value={s.audience} onChange={(e) => set({ audience: e.target.value as typeof s.audience })}>
              <option value="child">Child</option><option value="teen">Teen</option><option value="beginner">Beginner</option><option value="adult">Adult general reader</option><option value="advanced">Advanced student</option><option value="researcher">Researcher</option>
            </select></div>
          <div><label htmlFor="dep">Default depth: {s.depth}/10</label><input id="dep" type="range" min={1} max={10} value={s.depth} onChange={(e) => set({ depth: Number(e.target.value) })} /></div>
        </div>
        <fieldset className="border-0 p-0 m-0"><legend className="text-sm muted mb-1">Curiosity profile (used only to order suggestions; you can reset it)</legend>
          <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => { const on = s.interests.includes(i); return <button key={i} className="chip cursor-pointer" aria-pressed={on} style={on ? { color: "var(--gold-soft)", borderColor: "var(--gold)" } : undefined} onClick={() => set({ interests: on ? s.interests.filter((x) => x !== i) : [...s.interests, i] })}>{i}</button>; })}</div>
        </fieldset>
      </section>

      <section className="card p-5 grid gap-3" aria-labelledby="data">
        <h2 id="data" className="m-0 text-xl">Your data</h2>
        <p className="muted m-0 text-sm">Export everything stored in your journey, or delete it from this device{account ? " (account copy is replaced on next sync)" : ""}.</p>
        <div className="flex flex-wrap gap-2">
          <button className="neon neon-ghost neon-sm" onClick={exportJson}><Download size={16} />Export JSON</button>
          {!confirm ? <button className="neon neon-ghost neon-sm" onClick={() => setConfirm(true)}><RotateCcw size={16} />Reset my journey</button>
            : <button className="neon neon-amber neon-sm" onClick={() => { reset(); setConfirm(false); }}>Confirm: erase progress, notes and saved items</button>}
          {account ? <button className="neon neon-ghost neon-sm" onClick={logout}><LogOut size={16} />Sign out</button>
            : <><Link href="/login" className="neon neon-blue neon-sm no-underline">Sign in</Link><Link href="/register" className="neon neon-gold neon-sm no-underline">Create account</Link></>}
        </div>
      </section>
    </div>
  );
}
