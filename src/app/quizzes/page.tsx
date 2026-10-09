import type { Metadata } from "next";
import Link from "next/link";
import { ALL, daily, byKind, type Investigation, type QuizQ } from "@/content";
import { Quiz } from "@/components/Investigation";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Quizzes & Quests", description: "Test what you have learned. Scores measure learning, not belief." };
export const revalidate = 3600;

export default function Quizzes() {
  const invs = byKind<Investigation>("investigations");
  const all: { q: QuizQ; from: string }[] = invs.flatMap((i) => i.quiz.map((q) => ({ q, from: i.title })));
  const today = new Date();
  const seed = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000);
  const pick = [0, 1, 2, 3].map((n) => all[(seed * 3 + n * 5) % all.length]);
  const key = `daily:${today.toISOString().slice(0, 10)}`;
  const featured = daily();
  return (
    <div className="wrap py-8 max-w-3xl grid gap-6">
      <div>
        <Crumbs items={[{ href: "/", label: "Home" }, { label: "Quizzes" }]} />
        <h1 className="m-0 text-4xl">Quizzes &amp; Quests</h1>
        <p className="muted mt-2">A daily mixed quiz, plus a quiz at the end of every investigation. Completing them earns XP and badges in <Link href="/journey">My Journey</Link>.</p>
      </div>
      <Quiz k={key} questions={pick.map((p) => p.q)} />
      <section className="card p-5">
        <h2 className="m-0 text-xl">Quest of the day</h2>
        <p className="m-0 mt-1 muted">Read <Link href={`/${featured.kind}/${featured.slug}`}><b>{featured.title}</b></Link>, then write one note about what surprised you. Notes are private.</p>
      </section>
      <section>
        <h2 className="text-xl m-0 mb-2">Quizzes by investigation</h2>
        <ul className="m-0 pl-5 grid gap-1">{invs.map((i) => <li key={i.slug}><Link href={`/investigations/${i.slug}`}>{i.title}</Link> <span className="muted text-sm">· {i.quiz.length} question{i.quiz.length > 1 ? "s" : ""}</span></li>)}</ul>
        <p className="muted text-xs mt-3">{ALL.length} entries on the platform; quizzes currently cover the investigations.</p>
      </section>
    </div>
  );
}
