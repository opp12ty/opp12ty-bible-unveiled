"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function call(url: string, method: string, body: unknown) {
  const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
function useAct() {
  const r = useRouter();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return {
    msg, err,
    async run(fn: () => Promise<unknown>, ok = "Saved.") {
      setMsg(""); setErr("");
      try { await fn(); setMsg(ok); r.refresh(); } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
    },
  };
}
const Note = ({ msg, err }: { msg: string; err: string }) => (<>{msg && <span role="status" style={{ color: "var(--emerald)" }}>{msg}</span>}{err && <span role="alert" style={{ color: "var(--red)" }}>{err}</span>}</>);

/* ------------------------------------------------------------ site settings */
export interface SettingsShape {
  home: { title: string; subtitle: string; announcement: string; featured: string[] };
  nav: { hidden: string[] };
  flags: { ai: boolean; community: boolean; vault: boolean; signups: boolean; payments: boolean };
  plans: { id: string; name: string; price: string; blurb: string; features: string[] }[];
}

export function SettingsForms({ s, navOptions, entryOptions }: { s: SettingsShape; navOptions: [string, string][]; entryOptions: [string, string][] }) {
  const a = useAct();
  const [home, setHome] = useState(s.home);
  const [hidden, setHidden] = useState(s.nav.hidden);
  const [flags, setFlags] = useState(s.flags);
  const [plans, setPlans] = useState(s.plans);
  const put = (key: string, value: unknown) => a.run(() => call("/api/admin/settings", "PUT", { key, value }));
  return (
    <div className="grid gap-6">
      <section className="card p-5 grid gap-3"><h2 className="m-0 text-xl">Homepage</h2>
        <div><label htmlFor="ht">Headline</label><input id="ht" type="text" value={home.title} onChange={(e) => setHome({ ...home, title: e.target.value })} /></div>
        <div><label htmlFor="hs">Sub-headline</label><textarea id="hs" value={home.subtitle} onChange={(e) => setHome({ ...home, subtitle: e.target.value })} /></div>
        <div><label htmlFor="ha">Site-wide announcement (leave empty for none)</label><input id="ha" type="text" value={home.announcement} onChange={(e) => setHome({ ...home, announcement: e.target.value })} /></div>
        <fieldset className="border-0 p-0 m-0"><legend className="text-sm muted">Featured investigations (up to 3 shown first)</legend>
          {[0, 1, 2].map((i) => (
            <select key={i} aria-label={`Featured ${i + 1}`} className="mb-2" value={home.featured[i] ?? ""} onChange={(e) => { const f = [...home.featured]; f[i] = e.target.value; setHome({ ...home, featured: f.filter(Boolean) }); }}>
              <option value="">(none)</option>{entryOptions.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          ))}
        </fieldset>
        <div className="flex gap-3 items-center"><button className="neon neon-gold neon-sm" onClick={() => put("home", home)}>Save homepage</button><Note msg={a.msg} err={a.err} /></div>
      </section>

      <section className="card p-5 grid gap-3"><h2 className="m-0 text-xl">Feature switches</h2>
        <p className="muted text-sm m-0">Switches also apply on the server: a disabled feature rejects requests, not just hides buttons.</p>
        {(Object.keys(flags) as (keyof typeof flags)[]).map((k) => (
          <label key={k} className="flex items-center gap-3 m-0" style={{ color: "var(--text)" }}>
            <input type="checkbox" style={{ width: 20, minHeight: 20 }} checked={flags[k]} onChange={() => setFlags({ ...flags, [k]: !flags[k] })} />
            {{ ai: "Unveiled AI", community: "Community questions", vault: "The Vault", signups: "Open sign-ups", payments: "Online payments are live (informational; no provider is connected unless configured)" }[k]}
          </label>
        ))}
        <div><button className="neon neon-gold neon-sm" onClick={() => put("flags", flags)}>Save switches</button></div>
      </section>

      <section className="card p-5 grid gap-3"><h2 className="m-0 text-xl">Navigation</h2>
        <p className="muted text-sm m-0">Untick an item to hide it from the header and menus.</p>
        <div className="grid gap-2 sm:grid-cols-2">{navOptions.map(([href, label]) => (
          <label key={href} className="flex items-center gap-3 m-0" style={{ color: "var(--text)" }}>
            <input type="checkbox" style={{ width: 20, minHeight: 20 }} checked={!hidden.includes(href)} onChange={() => setHidden(hidden.includes(href) ? hidden.filter((h) => h !== href) : [...hidden, href])} />{label}
          </label>
        ))}</div>
        <div><button className="neon neon-gold neon-sm" onClick={() => put("nav", { hidden })}>Save navigation</button></div>
      </section>

      <section className="card p-5 grid gap-4"><h2 className="m-0 text-xl">Plans and prices</h2>
        {plans.map((p, i) => (
          <div key={p.id} className="grid gap-2 p-3 rounded-lg" style={{ background: "rgba(255,255,255,.03)" }}>
            <div className="grid gap-2 sm:grid-cols-2">
              <div><label htmlFor={`pn${i}`}>Name</label><input id={`pn${i}`} type="text" value={p.name} onChange={(e) => setPlans(plans.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></div>
              <div><label htmlFor={`pp${i}`}>Price text</label><input id={`pp${i}`} type="text" value={p.price} onChange={(e) => setPlans(plans.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} /></div>
            </div>
            <div><label htmlFor={`pb${i}`}>Description</label><input id={`pb${i}`} type="text" value={p.blurb} onChange={(e) => setPlans(plans.map((x, j) => (j === i ? { ...x, blurb: e.target.value } : x)))} /></div>
            <div><label htmlFor={`pf${i}`}>Features (one per line)</label><textarea id={`pf${i}`} value={p.features.join("\n")} onChange={(e) => setPlans(plans.map((x, j) => (j === i ? { ...x, features: e.target.value.split("\n").filter(Boolean) } : x)))} /></div>
          </div>
        ))}
        <div><button className="neon neon-gold neon-sm" onClick={() => put("plans", plans)}>Save plans</button></div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ users */
export interface UserRow { id: string; email: string; name: string; role: string; plan: string; disabled: boolean; created_at: string }
export function UsersTable({ users, me }: { users: UserRow[]; me: string }) {
  const a = useAct();
  const patch = (id: string, body: object) => a.run(() => call("/api/admin/users", "PATCH", { id, ...body }));
  return (
    <div className="grid gap-3">
      <div className="flex gap-3 items-center"><Note msg={a.msg} err={a.err} /></div>
      <div className="card overflow-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <caption className="sr-only">Users</caption>
          <thead><tr className="text-left muted"><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Joined</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td className="p-3">{u.email}{u.name ? <span className="muted"> · {u.name}</span> : null}</td>
                <td className="p-3"><select aria-label={`Role for ${u.email}`} value={u.role} disabled={u.id === me} style={{ minHeight: 36 }} onChange={(e) => patch(u.id, { role: e.target.value })}><option>user</option><option>editor</option><option>admin</option></select></td>
                <td className="p-3"><select aria-label={`Plan for ${u.email}`} value={u.plan} style={{ minHeight: 36 }} onChange={(e) => patch(u.id, { plan: e.target.value })}><option>free</option><option>premium</option><option>institution</option></select></td>
                <td className="p-3"><button className="neon neon-ghost neon-sm" disabled={u.id === me} onClick={() => patch(u.id, { disabled: !u.disabled })}>{u.disabled ? "Disabled · enable" : "Active · disable"}</button></td>
                <td className="p-3 muted">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ moderation */
export function ModerationQueue({ questions, reports }: { questions: { id: number; text: string; topic: string; status: string; votes: number }[]; reports: { id: number; path: string; message: string; contact: string | null; status: string }[] }) {
  const a = useAct();
  const mod = (type: string, id: number, status: string) => a.run(() => call("/api/admin/moderate", "PATCH", { type, id, status }));
  return (
    <div className="grid gap-6">
      <Note msg={a.msg} err={a.err} />
      <section><h2 className="text-xl m-0 mb-3">Questions ({questions.length})</h2>
        {questions.length === 0 ? <div className="card p-4 muted">Nothing waiting.</div> : <ul className="list-none p-0 m-0 grid gap-3">{questions.map((q) => (
          <li key={q.id} className="card p-4"><p className="m-0">{q.text}</p><div className="muted text-xs my-2">{q.topic} · {q.status} · {q.votes} votes</div>
            <div className="flex gap-2 flex-wrap">{["approved", "researching", "answered", "rejected"].map((s) => <button key={s} className="neon neon-ghost neon-sm" onClick={() => mod("question", q.id, s)}>{s}</button>)}</div></li>
        ))}</ul>}
      </section>
      <section><h2 className="text-xl m-0 mb-3">Error reports ({reports.length})</h2>
        {reports.length === 0 ? <div className="card p-4 muted">Nothing waiting.</div> : <ul className="list-none p-0 m-0 grid gap-3">{reports.map((r) => (
          <li key={r.id} className="card p-4"><div className="muted text-xs">{r.path}{r.contact ? ` · ${r.contact}` : ""} · {r.status}</div><p className="m-0 mt-1">{r.message}</p>
            <div className="flex gap-2 flex-wrap mt-2">{["accepted", "fixed", "declined"].map((s) => <button key={s} className="neon neon-ghost neon-sm" onClick={() => mod("report", r.id, s)}>{s}</button>)}</div></li>
        ))}</ul>}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ content workflow */
export interface CmsRow { id: number; slug: string; status: string; version: number; updated_by: string | null; data: { title: string; question: string; summary: string; explanation: string[]; context: string; bible?: string; evidence: string; uncertainties: string; sources: string[]; tags: string[] } }
const BLANK = { title: "", question: "", summary: "", explanation: [""], context: "", bible: "", evidence: "", uncertainties: "", sources: [] as string[], tags: [] as string[] };

export function CmsManager({ rows, sourceOptions, isAdmin }: { rows: CmsRow[]; sourceOptions: [string, string][]; isAdmin: boolean }) {
  const a = useAct();
  const [editing, setEditing] = useState<number | null>(null);
  const [f, setF] = useState({ ...BLANK });
  const edit = (r?: CmsRow) => { setEditing(r?.id ?? 0); setF(r ? { ...BLANK, ...r.data, bible: r.data.bible ?? "" } : { ...BLANK }); };
  const payload = () => ({ ...f, bible: f.bible || undefined, explanation: f.explanation.filter((x) => x.trim()) });
  const save = () => a.run(async () => {
    if (editing) await call("/api/admin/cms", "PATCH", { id: editing, data: payload(), note: "Edited" });
    else await call("/api/admin/cms", "POST", { data: payload() });
    setEditing(null);
  });
  const move = (id: number, status: string) => a.run(() => call("/api/admin/cms", "PATCH", { id, status, note: `Moved to ${status}` }));

  return (
    <div className="grid gap-6">
      <div className="flex gap-3 items-center flex-wrap"><button className="neon neon-gold" onClick={() => edit()}>New Oddity Vault entry</button><Note msg={a.msg} err={a.err} /></div>

      {editing !== null && (
        <section className="card p-5 grid gap-3" aria-label="Entry editor">
          <h2 className="m-0 text-xl">{editing ? "Edit entry" : "New entry"}</h2>
          <div><label htmlFor="c-title">Title</label><input id="c-title" type="text" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><label htmlFor="c-q">Curious question</label><input id="c-q" type="text" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} /></div>
          <div><label htmlFor="c-s">One-sentence summary</label><input id="c-s" type="text" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></div>
          <div><label htmlFor="c-e">Explanation (blank line between paragraphs)</label><textarea id="c-e" style={{ minHeight: 140 }} value={f.explanation.join("\n\n")} onChange={(e) => setF({ ...f, explanation: e.target.value.split(/\n\s*\n/) })} /></div>
          <div><label htmlFor="c-c">Historical context</label><textarea id="c-c" value={f.context} onChange={(e) => setF({ ...f, context: e.target.value })} /></div>
          <div><label htmlFor="c-b">Biblical connection, if any (do not force one)</label><input id="c-b" type="text" value={f.bible} onChange={(e) => setF({ ...f, bible: e.target.value })} /></div>
          <div><label htmlFor="c-ev">Evidence</label><textarea id="c-ev" value={f.evidence} onChange={(e) => setF({ ...f, evidence: e.target.value })} /></div>
          <div><label htmlFor="c-u">Uncertainties (required to publish)</label><textarea id="c-u" value={f.uncertainties} onChange={(e) => setF({ ...f, uncertainties: e.target.value })} /></div>
          <div><label htmlFor="c-src">Sources (required to publish; hold Ctrl/Cmd to select several)</label>
            <select id="c-src" multiple size={6} value={f.sources} onChange={(e) => setF({ ...f, sources: [...e.target.selectedOptions].map((o) => o.value) })}>{sourceOptions.map(([id, t]) => <option key={id} value={id}>{t}</option>)}</select></div>
          <div><label htmlFor="c-t">Tags (comma separated)</label><input id="c-t" type="text" value={f.tags.join(", ")} onChange={(e) => setF({ ...f, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></div>
          <div className="flex gap-2"><button className="neon neon-gold neon-sm" onClick={save}>Save draft</button><button className="neon neon-ghost neon-sm" onClick={() => setEditing(null)}>Cancel</button></div>
        </section>
      )}

      <section><h2 className="text-xl m-0 mb-3">Managed entries ({rows.length})</h2>
        {rows.length === 0 ? <div className="card p-4 muted">No managed entries yet. The built-in research content is edited in code and reviewed through version control.</div> : (
          <ul className="list-none p-0 m-0 grid gap-3">{rows.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex gap-2 items-center flex-wrap"><b>{r.data.title}</b><span className="chip">{r.status}</span><span className="chip">v{r.version}</span><span className="muted text-xs">{r.updated_by}</span></div>
              <div className="flex gap-2 flex-wrap mt-3">
                <button className="neon neon-ghost neon-sm" onClick={() => edit(r)}>Edit</button>
                {r.status === "draft" || r.status === "needs-revision" ? <button className="neon neon-blue neon-sm" onClick={() => move(r.id, "pending-review")}>Request review</button> : null}
                {isAdmin && <>
                  <button className="neon neon-emerald neon-sm" onClick={() => move(r.id, "published")}>Publish</button>
                  <button className="neon neon-amber neon-sm" onClick={() => move(r.id, "needs-revision")}>Needs revision</button>
                  <button className="neon neon-ghost neon-sm" onClick={() => move(r.id, "archived")}>Archive</button>
                </>}
              </div>
            </li>
          ))}</ul>
        )}
      </section>
    </div>
  );
}
