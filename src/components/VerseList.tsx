"use client";
import Link from "next/link";
import { useJourney } from "@/lib/journey";

interface Word { w: string; s: string[]; em?: boolean }
interface Item { n: number; words: Word[] | null; text: string; other: string; otherRtl: boolean }

export function VerseList({ slug, chapter, items, rtl, compareLabel }: { slug: string; chapter: number; items: Item[]; rtl: boolean; compareLabel?: string }) {
  const { s, toggleSave } = useJourney();
  return (
    <div style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", lineHeight: 1.85 }}>
      {items.map((v) => {
        const k = `v:${slug}:${chapter}:${v.n}`;
        const on = s.saved.includes(k);
        return (
          <p key={v.n} id={"v" + v.n} className="m-0 mb-2 rounded px-1" style={on ? { background: "rgba(217,173,75,.35)" } : undefined}>
            <button onClick={() => toggleSave(k)} aria-pressed={on} aria-label={`Highlight verse ${v.n}`} className="text-xs font-bold align-super mr-1 cursor-pointer" style={{ color: "#7a4b12", [rtl ? "marginLeft" : "marginRight"]: 6 }}>{v.n}</button>
            {v.words
              ? v.words.map((w, i) => w.s.length
                ? <Link key={i} href={`/bible/strongs/${w.s[0]}`} className="no-underline" style={{ color: "inherit", borderBottom: "1px dotted #7a4b12", fontStyle: w.em ? "italic" : undefined }} title={w.s.join(", ")}>{w.w} </Link>
                : <span key={i} style={{ fontStyle: w.em ? "italic" : undefined }}>{w.w} </span>)
              : v.text}
            {v.other && <span className="block text-base mt-1" dir={v.otherRtl ? "rtl" : "ltr"} style={{ color: "#5a4a30", borderInlineStart: "3px solid rgba(80,55,20,.35)", paddingInlineStart: 10 }}><b className="text-xs uppercase mr-1">{compareLabel}</b>{v.other}</span>}
          </p>
        );
      })}
    </div>
  );
}
