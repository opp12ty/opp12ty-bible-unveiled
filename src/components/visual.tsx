import type { ReactNode } from "react";
import type { Entry, EvidenceKind, Kind, Status, VisualKind } from "@/content/types";

/* ---------- artwork: generated, honest about being a schematic ---------- */
const HUES: Record<string, [string, string]> = {
  gold: ["#d9ad4b", "#7a4b12"], blue: ["#43b0ff", "#16336e"], emerald: ["#34d6a0", "#0d4a3a"],
  violet: ["#ae95ff", "#33236b"], amber: ["#f3ab3c", "#6b3a08"], red: ["#ff7a7a", "#5e1a24"],
};
const GLYPH: Record<Kind, ReactNode> = {
  investigations: <><circle cx="28" cy="28" r="14" /><path d="M39 39l14 14" /></>,
  "oddity-vault": <><path d="M20 14h24l-3 8v6c8 3 10 10 10 16 0 7-7 8-19 8s-19-1-19-8c0-6 2-13 10-16v-6z" /></>,
  "belief-check": <><circle cx="32" cy="32" r="20" /><path d="M22 33l7 7 14-15" /></>,
  interpretations: <><circle cx="24" cy="32" r="14" /><circle cx="40" cy="32" r="14" /></>,
  silence: <><path d="M8 32h8l4-12 8 24 8-18 4 6h16" /></>,
  archaeology: <><path d="M12 48l20-34 20 34z" /><path d="M22 40h20" /></>,
  manuscripts: <><path d="M14 14h30a6 6 0 0 1 6 6v30H20a6 6 0 0 1-6-6z" /><path d="M22 24h20M22 32h20M22 40h12" /></>,
  objects: <><path d="M24 10h16v8c10 4 12 12 12 20 0 10-8 14-20 14S12 48 12 38c0-8 2-16 12-20z" /></>,
  people: <><circle cx="32" cy="22" r="10" /><path d="M12 54c2-14 10-18 20-18s18 4 20 18" /></>,
  places: <><path d="M32 56S14 38 14 26a18 18 0 0 1 36 0c0 12-18 30-18 30z" /><circle cx="32" cy="26" r="6" /></>,
  "ancient-world": <><path d="M8 20l24-10 24 10M12 24v24M26 24v24M38 24v24M52 24v24M8 52h48" /></>,
};

export const VISUAL_LABEL: Record<VisualKind, string> = {
  "authentic-photograph": "Schematic of an authentic find",
  "historical-illustration": "Historical illustration",
  "digital-reconstruction": "Digital reconstruction",
  "ai-generated": "AI-generated visual",
  "artistic-interpretation": "Artistic interpretation",
  "schematic-diagram": "Schematic diagram",
};

export function Art({ entry, h = 140, label = true }: { entry: Pick<Entry, "kind" | "art" | "visual">; h?: number; label?: boolean }) {
  const [a, b] = HUES[entry.art ?? "gold"] ?? HUES.gold;
  const id = `g-${entry.kind}-${entry.art ?? "gold"}`;
  return (
    <figure className="m-0 relative overflow-hidden rounded-xl" style={{ height: h }} aria-hidden>
      <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={b} /><stop offset="1" stopColor="#060a16" /></linearGradient>
          <pattern id={id + "p"} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 28L28 0" stroke={a} strokeOpacity=".12" strokeWidth="1" /></pattern>
          <radialGradient id={id + "r"} cx=".75" cy=".3" r=".8"><stop offset="0" stopColor={a} stopOpacity=".55" /><stop offset="1" stopColor={a} stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="140" fill={`url(#${id})`} />
        <rect width="400" height="140" fill={`url(#${id}p)`} />
        <rect width="400" height="140" fill={`url(#${id}r)`} />
        <g transform="translate(262 22) scale(1.6)" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".9">{GLYPH[entry.kind]}</g>
      </svg>
      {label && entry.visual && (
        <figcaption className="absolute left-2 bottom-2 chip" style={{ background: "rgba(6,10,22,.7)" }}>{VISUAL_LABEL[entry.visual]}</figcaption>
      )}
    </figure>
  );
}

/* ---------- status & evidence: icon + word, never colour alone ---------- */
const STATUS: Record<Status, { label: string; color: string; mark: string }> = {
  documented: { label: "Documented", color: "var(--emerald)", mark: "●" },
  "well-supported": { label: "Well supported", color: "var(--emerald)", mark: "◕" },
  likely: { label: "Likely", color: "var(--blue)", mark: "◑" },
  debated: { label: "Debated", color: "var(--amber)", mark: "⇄" },
  unknown: { label: "Unknown", color: "var(--violet)", mark: "?" },
};
export function StatusBadge({ s }: { s: Status }) {
  const m = STATUS[s];
  return <span className="chip" style={{ color: m.color, borderColor: m.color }}><span aria-hidden>{m.mark}</span>{m.label}</span>;
}

export const EVIDENCE: Record<EvidenceKind, { label: string; color: string }> = {
  scripture: { label: "Scripture", color: "var(--gold-soft)" },
  "original-language": { label: "Original language", color: "var(--blue)" },
  history: { label: "History", color: "var(--amber)" },
  "ancient-sources": { label: "Ancient sources", color: "var(--amber)" },
  archaeology: { label: "Archaeology", color: "var(--emerald)" },
  manuscripts: { label: "Manuscripts", color: "var(--emerald)" },
  scholarship: { label: "Scholarship", color: "var(--blue)" },
  tradition: { label: "Religious tradition", color: "var(--violet)" },
  "popular-culture": { label: "Popular culture", color: "var(--muted)" },
  speculation: { label: "Speculation", color: "var(--red)" },
};
export function EvidenceBadge({ k }: { k: EvidenceKind }) {
  const m = EVIDENCE[k];
  return <span className="chip" style={{ color: m.color }}><i aria-hidden />{m.label}</span>;
}

