"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "setup";

export function AuthForm({ mode }: { mode: Mode }) {
  const r = useRouter();
  const [f, setF] = useState({ email: "", name: "", password: "", token: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const url = mode === "setup" ? "/api/admin/setup" : `/api/auth/${mode}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const body: Record<string, string> = { email: f.email, password: f.password };
      if (mode !== "login") body.name = f.name;
      if (mode === "setup") body.token = f.token;
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "That did not work. Please try again.");
      r.push(mode === "setup" || j.role === "admin" ? "/admin" : "/journey");
      r.refresh();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  const title = mode === "login" ? "Sign in" : mode === "register" ? "Create your account" : "Create the administrator account";
  return (
    <div className="wrap py-10 max-w-md">
      <h1 className="m-0 text-3xl">{title}</h1>
      {mode === "setup" && <p className="muted">Enter the setup token from your deployment settings, then choose your own email and password. The token works only while no administrator exists.</p>}
      <form onSubmit={submit} className="card p-5 grid gap-4 mt-5" noValidate>
        {mode === "setup" && <div><label htmlFor="token">Setup token</label><input id="token" type="password" autoComplete="off" value={f.token} onChange={(e) => setF({ ...f, token: e.target.value })} required /></div>}
        {mode !== "login" && <div><label htmlFor="name">Name (optional)</label><input id="name" type="text" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>}
        <div><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><label htmlFor="pw">Password</label><input id="pw" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required aria-describedby="pwh" />
          {mode !== "login" && <p id="pwh" className="muted text-xs m-0 mt-1">At least 10 characters, with letters and numbers. You choose it; we never see it in plain text.</p>}</div>
        {err && <p role="alert" className="m-0" style={{ color: "var(--red)" }}>{err}</p>}
        <button className="neon neon-gold justify-center" disabled={busy} type="submit">{busy ? "Please wait…" : title}</button>
      </form>
      <p className="muted text-sm mt-4">
        {mode === "login" ? <>New here? <Link href="/register">Create an account</Link>.</> : mode === "register" ? <>Already have one? <Link href="/login">Sign in</Link>.</> : null}
      </p>
    </div>
  );
}
