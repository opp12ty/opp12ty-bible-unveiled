"use client";
import { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";

interface Q { id: number; text: string; topic: string; votes: number; status: string; created_at: string }
const TOPICS = ["general", "suffering", "violence", "textual questions", "archaeology", "languages", "religious disagreement", "difficult passages"];
const STATUS: Record<string, string> = { approved: "Open", researching: "Being researched", answered: "Answered" };

export function QuestionBoard() {
  const [list, setList] = useState<Q[] | null>(null);
  const [needsDb, setNeedsDb] = useState(false);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("general");
  const [msg, setMsg] = useState("");
  const [voted, setVoted] = useState<number[]>([]);

  async function load() {
    const r = await fetch("/api/questions", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (r.status === 503) { setNeedsDb(true); setList([]); return; }
    setList(j.questions ?? []);
  }
  useEffect(() => { load(); try { setVoted(JSON.parse(localStorage.getItem("ub.voted") ?? "[]")); } catch { /* ignore */ } }, []);

  async function submit() {
    setMsg("");
    const r = await fetch("/api/questions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, topic }) });
    const j = await r.json().catch(() => ({}));
    setMsg(j.message || j.error || "");
    if (r.ok) setText("");
  }
  async function vote(id: number) {
    if (voted.includes(id)) return;
    const r = await fetch("/api/questions", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) {
      const next = [...voted, id]; setVoted(next);
      try { localStorage.setItem("ub.voted", JSON.stringify(next)); } catch { /* ignore */ }
      setList((l) => l?.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q)) ?? l);
    }
  }

  return (
    <div className="grid gap-6">
      {needsDb && <div className="card p-4" role="status" style={{ borderColor: "rgba(243,171,60,.5)" }}>The community board needs the database, which is not configured on this deployment yet. It switches on automatically once it is.</div>}
      <div className="card p-5 grid gap-3">
        <h2 className="m-0 text-xl">Ask a question people are afraid to ask</h2>
        <div><label htmlFor="qt">Your question</label><textarea id="qt" value={text} maxLength={400} onChange={(e) => setText(e.target.value)} placeholder="Be specific and respectful. Do not include private information." /></div>
        <div><label htmlFor="qtopic">Topic</label><select id="qtopic" value={topic} onChange={(e) => setTopic(e.target.value)}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="neon neon-gold" disabled={text.trim().length < 12 || needsDb} onClick={submit}>Submit for moderation</button>
          {msg && <span role="status" className="muted">{msg}</span>}
        </div>
        <p className="muted text-xs m-0">Questions are reviewed before they appear. No account is needed. We do not publish names or contact details.</p>
      </div>
      <div>
        <h2 className="text-xl m-0 mb-3">Questions the community wants researched</h2>
        {list === null ? <p className="muted">Loading…</p> : list.length === 0 ? <div className="card p-5">No approved questions yet. Be the first to ask.</div> : (
          <ul className="list-none p-0 m-0 grid gap-3">
            {list.map((q) => (
              <li key={q.id} className="card p-4 flex gap-3 items-start">
                <button className="neon neon-ghost neon-sm flex-col" aria-label={`Vote for: ${q.text}`} disabled={voted.includes(q.id)} onClick={() => vote(q.id)}><ThumbsUp size={16} />{q.votes}</button>
                <div><div className="font-semibold">{q.text}</div><div className="flex gap-2 mt-1"><span className="chip">{q.topic}</span><span className="chip">{STATUS[q.status] ?? q.status}</span></div></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
