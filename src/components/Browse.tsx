"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Art } from "./visual";
import type { Kind } from "@/content/types";

export interface BrowseItem { k: string; kind: Kind; kindLabel: string; title: string; summary: string; tags: string[]; art?: string; premium?: boolean; badge?: string }

export function Browse({ items, placeholder = "Filter this list…" }: { items: BrowseItem[]; placeholder?: string }) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");
  const tags = useMemo(() => {
    const n = new Map<string, number>();
    items.forEach((i) => i.tags.forEach((t) => n.set(t, (n.get(t) ?? 0) + 1)));
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);
  }, [items]);
  const list = items.filter((i) => (!tag || i.tags.includes(tag)) && (!text || (i.title + " " + i.summary + " " + i.tags.join(" ")).toLowerCase().includes(text.toLowerCase())));
  return (
    <div>
      <div className="grid gap-3 mb-5">
        <div className="relative">
          <label htmlFor="flt" className="sr-only">Filter</label>
          <Search size={16} className="absolute left-3 top-3.5 muted" aria-hidden />
          <input id="flt" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} style={{ paddingLeft: 36 }} />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <button className={`chip cursor-pointer ${!tag ? "" : ""}`} aria-pressed={!tag} style={!tag ? { color: "var(--gold-soft)", borderColor: "var(--gold)" } : undefined} onClick={() => setTag("")}>All</button>
            {tags.map((t) => <button key={t} className="chip cursor-pointer" aria-pressed={tag === t} style={tag === t ? { color: "var(--gold-soft)", borderColor: "var(--gold)" } : undefined} onClick={() => setTag(tag === t ? "" : t)}>{t}</button>)}
          </div>
        )}
        <div className="muted text-sm" role="status">{list.length} of {items.length} shown</div>
      </div>
      {list.length === 0 ? (
        <div className="card p-6 text-center"><p className="m-0">Nothing matches that filter. Try a broader word or clear the topic.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => (
            <Link key={i.k} href={"/" + i.k} className="card card-hover block no-underline overflow-hidden" style={{ color: "var(--text)" }}>
              <Art entry={{ kind: i.kind, art: i.art }} h={92} label={false} />
              <div className="p-4">
                <div className="flex gap-2 mb-1.5 flex-wrap"><span className="chip">{i.kindLabel}</span>{i.badge && <span className="chip">{i.badge}</span>}{i.premium && <span className="chip" style={{ color: "var(--gold-soft)", borderColor: "var(--gold)" }}>Vault</span>}</div>
                <h2 className="m-0 text-lg leading-snug">{i.title}</h2>
                <p className="muted text-sm m-0 mt-1">{i.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
