"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * My Journey: progress, notes, saved items and preferences. It lives in the browser (localStorage) so every
 * feature works for guests, and is mirrored to the account (/api/sync) when the visitor is signed in.
 */
export const LEVELS = [
  { name: "Explorer", xp: 0 },
  { name: "Investigator", xp: 100 },
  { name: "Researcher", xp: 300 },
  { name: "Historian", xp: 700 },
  { name: "Scholar", xp: 1500 },
  { name: "Master Investigator", xp: 3000 },
] as const;

export const BADGES: Record<string, { name: string; how: string }> = {
  "first-investigation": { name: "First Investigation", how: "Complete your first investigation quiz." },
  "evidence-examiner": { name: "Evidence Examiner", how: "Open 5 discoveries or manuscripts." },
  "curious-mind": { name: "Curious Mind", how: "Visit 15 different entries." },
  "source-finder": { name: "Source Finder", how: "Save 5 items to your library." },
  "question-builder": { name: "Question Builder", how: "Write 3 research notes." },
  "learning-streak": { name: "Learning Streak", how: "Visit on 3 days in a row." },
  "belief-checker": { name: "Belief Checker", how: "Check 5 popular beliefs." },
};

export interface JState {
  v: 1;
  xp: number;
  saved: string[];
  notes: Record<string, string>;
  conclusions: Record<string, string>;
  quiz: Record<string, { score: number; total: number }>;
  seen: string[];
  awarded: string[];
  badges: string[];
  streak: { last: string; count: number };
  depth: number;
  audience: "child" | "teen" | "beginner" | "adult" | "advanced" | "researcher";
  interests: string[];
  recent: string[];
  last?: { k: string; title: string };
  immersive: boolean;
  revealed: string[];
}

const EMPTY: JState = {
  v: 1, xp: 0, saved: [], notes: {}, conclusions: {}, quiz: {}, seen: [], awarded: [], badges: [],
  streak: { last: "", count: 0 }, depth: 3, audience: "adult", interests: [], recent: [], immersive: false, revealed: [],
};

const KEY = "ub.journey.v1";
const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function levelFor(xp: number) {
  let i = 0;
  LEVELS.forEach((l, n) => { if (xp >= l.xp) i = n; });
  const next = LEVELS[i + 1];
  return { index: i, name: LEVELS[i].name, next: next?.name, toNext: next ? next.xp - xp : 0, pct: next ? (xp - LEVELS[i].xp) / (next.xp - LEVELS[i].xp) : 1 };
}

function read(): JState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<JState>) };
  } catch { return { ...EMPTY }; }
}

export function mergeStates(a: JState, b: JState): JState {
  const uniq = <T,>(x: T[], y: T[]) => [...new Set([...x, ...y])];
  return {
    ...a,
    xp: Math.max(a.xp, b.xp),
    saved: uniq(a.saved, b.saved),
    notes: { ...b.notes, ...a.notes },
    conclusions: { ...b.conclusions, ...a.conclusions },
    quiz: { ...b.quiz, ...a.quiz },
    seen: uniq(a.seen, b.seen),
    awarded: uniq(a.awarded, b.awarded),
    badges: uniq(a.badges, b.badges),
    revealed: uniq(a.revealed, b.revealed),
    interests: uniq(a.interests, b.interests),
    recent: uniq(a.recent, b.recent).slice(0, 12),
    streak: a.streak.count >= b.streak.count ? a.streak : b.streak,
  };
}

interface Ctx {
  s: JState;
  ready: boolean;
  set: (patch: Partial<JState>) => void;
  award: (id: string, xp: number) => void;
  toggleSave: (k: string) => void;
  visit: (k: string, title: string) => void;
  setNote: (k: string, text: string) => void;
  recordQuiz: (k: string, score: number, total: number) => void;
  reveal: (id: string) => void;
  reset: () => void;
  account: { email: string; name: string; role: string } | null;
}

const C = createContext<Ctx | null>(null);
export const useJourney = () => {
  const c = useContext(C);
  if (!c) throw new Error("JourneyProvider missing");
  return c;
};

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<JState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Ctx["account"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synced = useRef(false);

  // hydrate from localStorage, then from the account if any
  useEffect(() => {
    let st = read();
    const t = today();
    if (st.streak.last !== t) {
      const gap = st.streak.last ? dayDiff(st.streak.last, t) : 99;
      st = { ...st, streak: { last: t, count: gap === 1 ? st.streak.count + 1 : 1 } };
    }
    setS(st);
    setReady(true);
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (me) => {
        if (!me?.user) return;
        setAccount(me.user);
        const r = await fetch("/api/sync", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j?.state) setS((cur) => mergeStates(cur, { ...EMPTY, ...j.state }));
        }
        synced.current = true;
      })
      .catch(() => {});
  }, []);

  // persist (debounced) and push to the account
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage may be blocked */ }
    if (!account || !synced.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/sync", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: s }) }).catch(() => {});
    }, 1500);
  }, [s, ready, account]);

  const checkBadges = (st: JState): JState => {
    const have = new Set(st.badges);
    const give = (id: string, ok: boolean) => { if (ok && !have.has(id)) have.add(id); };
    give("first-investigation", Object.keys(st.quiz).some((k) => k.startsWith("investigations/")));
    give("evidence-examiner", st.seen.filter((k) => k.startsWith("archaeology/") || k.startsWith("manuscripts/")).length >= 5);
    give("curious-mind", st.seen.length >= 15);
    give("source-finder", st.saved.length >= 5);
    give("question-builder", Object.values(st.notes).filter((n) => n.trim().length > 0).length >= 3);
    give("learning-streak", st.streak.count >= 3);
    give("belief-checker", st.seen.filter((k) => k.startsWith("belief-check/")).length >= 5);
    return have.size === st.badges.length ? st : { ...st, badges: [...have] };
  };
  const upd = useCallback((fn: (st: JState) => JState) => setS((cur) => checkBadges(fn(cur))), []);

  const api = useMemo<Ctx>(() => ({
    s, ready, account,
    set: (patch) => upd((st) => ({ ...st, ...patch })),
    award: (id, xp) => upd((st) => (st.awarded.includes(id) ? st : { ...st, xp: st.xp + xp, awarded: [...st.awarded, id] })),
    toggleSave: (k) => upd((st) => {
      const saved = st.saved.includes(k) ? st.saved.filter((x) => x !== k) : [...st.saved, k];
      const first = !st.saved.includes(k) && !st.awarded.includes("save:" + k);
      return { ...st, saved, xp: st.xp + (first ? 3 : 0), awarded: first ? [...st.awarded, "save:" + k] : st.awarded };
    }),
    visit: (k, title) => upd((st) => {
      const first = !st.seen.includes(k);
      return { ...st, seen: first ? [...st.seen, k] : st.seen, xp: st.xp + (first ? 5 : 0), last: { k, title }, recent: [k, ...st.recent.filter((x) => x !== k)].slice(0, 12) };
    }),
    setNote: (k, text) => upd((st) => ({ ...st, notes: { ...st.notes, [k]: text } })),
    recordQuiz: (k, score, total) => upd((st) => {
      const prev = st.quiz[k];
      const gain = !prev ? 10 + score * 5 : 0;
      return { ...st, quiz: { ...st.quiz, [k]: !prev || score > prev.score ? { score, total } : prev }, xp: st.xp + gain };
    }),
    reveal: (id) => upd((st) => (st.revealed.includes(id) ? st : { ...st, revealed: [...st.revealed, id], xp: st.xp + 2 })),
    reset: () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } setS({ ...EMPTY, streak: { last: today(), count: 1 } }); },
  }), [s, ready, account, upd]);

  return <C.Provider value={api}>{children}</C.Provider>;
}
