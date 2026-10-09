"use client";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { levelFor, useJourney } from "@/lib/journey";

export function ContinueCard() {
  const { s, ready } = useJourney();
  if (!ready || !s.last) return null;
  const lvl = levelFor(s.xp);
  return (
    <section aria-label="Continue investigating" className="card p-5 flex flex-wrap items-center gap-4 justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>Continue investigating</div>
        <div className="serif text-xl">{s.last.title}</div>
        <div className="muted text-sm">{lvl.name} · {s.xp} XP · {s.seen.length} entries explored · {s.streak.count}-day streak</div>
      </div>
      <Link href={"/" + s.last.k} className="neon neon-gold no-underline"><PlayCircle size={18} />Continue <ArrowRight size={14} /></Link>
    </section>
  );
}
