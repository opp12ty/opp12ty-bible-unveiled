import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { ModerationQueue } from "@/components/AdminForms";
import { q } from "@/server/db";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Moderation() {
  return (
    <AdminShell>
      {async () => {
        const questions = await q<{ id: number; text: string; topic: string; status: string; votes: number }>("select id, text, topic, status, votes from questions where status in ('pending','approved','researching') order by status='pending' desc, votes desc limit 100");
        const reports = await q<{ id: number; path: string; message: string; contact: string | null; status: string }>("select id, path, message, contact, status from reports where status in ('open','accepted') order by created_at desc limit 100");
        return <div className="grid gap-4"><h1 className="m-0 text-3xl">Moderation</h1><ModerationQueue questions={questions} reports={reports} /></div>;
      }}
    </AdminShell>
  );
}
