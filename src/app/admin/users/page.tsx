import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { UsersTable, type UserRow } from "@/components/AdminForms";
import { q } from "@/server/db";

export const metadata: Metadata = { title: "Users", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Users() {
  return (
    <AdminShell need="admin">
      {async (me) => {
        const users = await q<UserRow>("select id, email, name, role, plan, disabled, created_at from users order by created_at desc limit 300");
        return <div className="grid gap-4"><h1 className="m-0 text-3xl">Users</h1><UsersTable users={users.map((u) => ({ ...u, created_at: String(u.created_at) }))} me={me.id} /></div>;
      }}
    </AdminShell>
  );
}
