"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "./visual";
import type { TimelineEvent } from "@/content/types";

const REGIONS: Record<TimelineEvent["region"], { label: string; color: string }> = {
  israel: { label: "Israel & Judah", color: "var(--gold)" },
  egypt: { label: "Egypt", color: "var(--amber)" },
  mesopotamia: { label: "Mesopotamia", color: "var(--red)" },
  persia: { label: "Persia", color: "var(--violet)" },
  "greece-rome": { label: "Greece & Rome", color: "var(--blue)" },
  text: { label: "Texts & manuscripts", color: "var(--emerald)" },
};
const fmt = (y: number) => (y < 0 ? `${-y} BCE` : `${y} CE`);

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  const min = Math.min(...events.map((e) => e.year)), max = Math.max(...events.map((e) => e.year));
  const [from, setFrom] = useState(min), [to, setTo] = useState(max);
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(Object.keys(REGIONS).map((k) => [k, true])));
  const list = useMemo(() => events.filter((e) => on[e.region] && e.year >= from && e.year <= to).sort((a, b) => a.year - b.year), [events, on, from, to]);
  return (
    <div>
      <div className="card p-4 grid gap-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="from">From: <b>{fmt(from)}</b></label><input id="from" type="range" min={min} max={max} value={from} onChange={(e) => setFrom(Math.min(Number(e.target.value), to))} /></div>
          <div><label htmlFor="to">To: <b>{fmt(to)}</b></label><input id="to" type="range" min={min} max={max} value={to} onChange={(e) => setTo(Math.max(Number(e.target.value), from))} /></div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Regions">
          {(Object.keys(REGIONS) as TimelineEvent["region"][]).map((r) => (
            <label key={r} className="chip cursor-pointer m-0" style={{ color: REGIONS[r].color }}>
              <input type="checkbox" checked={on[r]} onChange={() => setOn({ ...on, [r]: !on[r] })} style={{ width: 14, height: 14, minHeight: 0 }} />{REGIONS[r].label}
            </label>
          ))}
        </div>
        <p className="muted text-xs m-0" role="status">{list.length} events · dates are approximate where marked “c.” and carry the editorial confidence shown.</p>
      </div>
      {list.length === 0 ? <div className="card p-6">No events in that range. Widen the dates or turn on more regions.</div> : (
        <ol className="list-none p-0 m-0 relative" style={{ borderLeft: "2px solid var(--line)", marginLeft: 8 }}>
          {list.map((e) => (
            <li key={e.id} className="relative pl-6 pb-5">
              <span aria-hidden className="absolute -left-[7px] top-2 w-3 h-3 rounded-full" style={{ background: REGIONS[e.region].color, boxShadow: `0 0 10px ${REGIONS[e.region].color}` }} />
              <div className="card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="serif text-lg" style={{ color: REGIONS[e.region].color }}>{e.certainty === "documented" ? "" : "c. "}{fmt(e.year)}{e.yearTo ? `–${fmt(e.yearTo)}` : ""}</b>
                  <span className="chip" style={{ color: REGIONS[e.region].color }}>{REGIONS[e.region].label}</span>
                  <StatusBadge s={e.certainty} />
                </div>
                <h2 className="m-0 mt-1 text-lg">{e.link ? <Link href={"/" + e.link}>{e.label}</Link> : e.label}</h2>
                <p className="m-0 muted text-sm">{e.note}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
