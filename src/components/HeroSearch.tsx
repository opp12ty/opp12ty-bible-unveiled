"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const IDEAS = ["Goliath", "John 3:16", "Dead Sea Scrolls", "Pilate", "mourning", "Isaiah 53", "Babylon", "how did they tell time"];

export function HeroSearch() {
  const r = useRouter();
  const [q, setQ] = useState("");
  return (
    <form role="search" className="max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); if (q.trim()) r.push(`/search?q=${encodeURIComponent(q.trim())}`); }}>
      <div className="flex gap-2">
        <label htmlFor="hero-q" className="sr-only">Search investigations, people, places, verses and original-language words</label>
        <input id="hero-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a verse, a person, a place, a word…" style={{ fontSize: "1.05rem", minHeight: 52, borderRadius: 999, paddingInline: 20 }} />
        <button className="neon neon-blue" type="submit"><Search size={18} />Investigate</button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-3" aria-label="Try searching">
        {IDEAS.map((i) => <button type="button" key={i} className="chip cursor-pointer" onClick={() => r.push(`/search?q=${encodeURIComponent(i)}`)}>{i}</button>)}
      </div>
    </form>
  );
}
