import Link from "next/link";
import type { ReactNode } from "react";
import { currentUser, type SessionUser } from "@/server/auth";
import { hasDb } from "@/server/db";

const LINKS = [
  ["/admin", "Dashboard"], ["/admin/content", "Content"], ["/admin/settings", "Site settings"], ["/admin/moderation", "Moderation"],
  ["/admin/users", "Users"], ["/admin/audit", "Audit log"], ["/admin/health", "System health"],
] as const;

/** Server-side gate: every admin page renders through this. UI hiding is never the only control; APIs re-check roles. */
export async function AdminShell({ children, need = "editor" }: { children: (u: SessionUser) => ReactNode | Promise<ReactNode>; need?: "editor" | "admin" }) {
  if (!hasDb()) {
    return (
      <div className="wrap py-10 max-w-2xl">
        <h1 className="m-0 text-3xl">Administration</h1>
        <div className="card p-5 mt-4">
          <p className="m-0"><b>The database is not configured on this deployment.</b></p>
          <p>The administration area stores users, content workflow, settings and audit logs in Postgres. Set <code>DATABASE_URL</code> and <code>SETUP_TOKEN</code> in the hosting environment, redeploy, then visit <code>/admin/setup</code> to create your administrator account with a password of your own choosing.</p>
          <p className="m-0 muted text-sm">The public site works fully without it.</p>
        </div>
      </div>
    );
  }
  const u = await currentUser();
  if (!u) {
    return (
      <div className="wrap py-10 max-w-xl">
        <h1 className="m-0 text-3xl">Administration</h1>
        <p className="muted">Sign in with an editor or administrator account.</p>
        <div className="flex gap-2"><Link href="/login" className="neon neon-gold no-underline">Sign in</Link><Link href="/admin/setup" className="neon neon-ghost no-underline">First-time setup</Link></div>
      </div>
    );
  }
  const ok = need === "admin" ? u.role === "admin" : u.role === "admin" || u.role === "editor";
  if (!ok) {
    return (
      <div className="wrap py-10 max-w-xl">
        <h1 className="m-0 text-3xl">Not permitted</h1>
        <p className="muted">Your account ({u.email}) does not have access to this area.</p>
        <Link href="/" className="neon neon-ghost no-underline">Back to the site</Link>
      </div>
    );
  }
  return (
    <div className="wrap py-6">
      <nav aria-label="Administration" className="flex gap-2 flex-wrap mb-6">
        {LINKS.filter(([h]) => u.role === "admin" || ["/admin", "/admin/content", "/admin/moderation"].includes(h)).map(([h, l]) => <Link key={h} href={h} className="chip no-underline">{l}</Link>)}
        <span className="chip ml-auto">{u.email} · {u.role}</span>
      </nav>
      {await children(u)}
    </div>
  );
}
