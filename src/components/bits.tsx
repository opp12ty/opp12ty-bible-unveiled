"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Flag, Share2 } from "lucide-react";
import { useJourney } from "@/lib/journey";

export function track(name: string) {
  try { fetch("/api/event", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }), keepalive: true }).catch(() => {}); } catch { /* ignore */ }
}

/** Records a page visit in My Journey (XP once per entry) and the privacy-safe "view" counter. */
export function Visit({ k, title }: { k: string; title: string }) {
  const { visit, ready } = useJourney();
  const done = useRef(false);
  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    visit(k, title);
    track("view");
  }, [ready, k, title, visit]);
  return null;
}

export function SaveButton({ k }: { k: string }) {
  const { s, toggleSave } = useJourney();
  const on = s.saved.includes(k);
  return (
    <button className={`neon neon-sm ${on ? "neon-emerald" : "neon-ghost"}`} aria-pressed={on} onClick={() => { toggleSave(k); if (!on) track("save"); }}>
      {on ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{on ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [msg, setMsg] = useState("");
  async function share() {
    const url = location.origin + path;
    try {
      if (navigator.share) { await navigator.share({ title, url }); track("share"); return; }
      await navigator.clipboard.writeText(url);
      setMsg("Link copied"); track("share");
      setTimeout(() => setMsg(""), 2000);
    } catch { /* user cancelled */ }
  }
  return <button className="neon neon-ghost neon-sm" onClick={share}><Share2 size={16} />{msg || "Share"}</button>;
}

export function NoteBox({ k, label = "My research notes" }: { k: string; label?: string }) {
  const { s, setNote, ready } = useJourney();
  const [v, setV] = useState("");
  const loaded = useRef(false);
  useEffect(() => { if (ready && !loaded.current) { loaded.current = true; setV(s.notes[k] ?? ""); } }, [ready, s.notes, k]);
  return (
    <div>
      <label htmlFor={"note-" + k}>{label} <span className="muted">(private to your device{s.xp >= 0 ? " or account" : ""}; not shown publicly)</span></label>
      <textarea id={"note-" + k} value={v} maxLength={4000} placeholder="What stands out? What would you check next?" onChange={(e) => { setV(e.target.value); setNote(k, e.target.value); }} />
    </div>
  );
}

export function ReportError({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  const [note, setNote] = useState("");
  async function send() {
    setState("busy");
    const r = await fetch("/api/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, message: msg, contact: contact || undefined }) });
    const j = await r.json().catch(() => ({}));
    setNote(j.message || j.error || "");
    setState(r.ok ? "done" : "err");
  }
  return (
    <div className="mt-6">
      <button className="neon neon-ghost neon-sm" onClick={() => setOpen(!open)} aria-expanded={open}><Flag size={16} />Report a possible error</button>
      {open && (
        <div className="card p-4 mt-3 grid gap-3 max-w-xl">
          {state === "done" ? <p className="m-0" role="status">{note}</p> : (
            <>
              <div><label htmlFor="rep-msg">What looks wrong or unsupported?</label><textarea id="rep-msg" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1500} /></div>
              <div><label htmlFor="rep-c">Email (optional, only used to reply)</label><input id="rep-c" type="email" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
              {state === "err" && <p className="m-0" role="alert" style={{ color: "var(--red)" }}>{note}</p>}
              <div><button className="neon neon-gold neon-sm" disabled={msg.trim().length < 10 || state === "busy"} onClick={send}>Send report</button></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
