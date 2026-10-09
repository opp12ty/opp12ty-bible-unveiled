"use client";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LMap, CircleMarker } from "leaflet";

export interface MapPlace { slug: string; title: string; lat: number; lng: number; location: "known" | "proposed" | "disputed"; modern: string; summary: string; period: string }

const STYLE = {
  known: { color: "#d9ad4b", fill: "#d9ad4b", dash: undefined as string | undefined, label: "Securely located" },
  proposed: { color: "#43b0ff", fill: "#0a1124", dash: undefined, label: "Proposed identification" },
  disputed: { color: "#ae95ff", fill: "#0a1124", dash: "3 3", label: "Disputed location" },
};

export function MapView({ places, focus }: { places: MapPlace[]; focus?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const markers = useRef<Map<string, CircleMarker>>(new Map());
  const [show, setShow] = useState({ known: true, proposed: true, disputed: true });
  const [sel, setSel] = useState<string | undefined>(focus);
  const [tilesFailed, setTilesFailed] = useState(false);

  const visible = useMemo(() => places.filter((p) => show[p.location]), [places, show]);

  useEffect(() => {
    let dead = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !el.current || map.current) return;
      const m = L.map(el.current, { center: [33, 35], zoom: 5, minZoom: 3, worldCopyJump: true });
      map.current = m;
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors · modern basemap", maxZoom: 12, className: "ub-tiles",
      });
      tiles.on("tileerror", () => setTilesFailed(true));
      tiles.addTo(m);
    })();
    return () => { dead = true; map.current?.remove(); map.current = null; markers.current.clear(); };
  }, []);

  useEffect(() => {
    let dead = false;
    (async () => {
      const L = (await import("leaflet")).default;
      // wait for the map to exist
      for (let i = 0; i < 30 && !map.current; i++) await new Promise((r) => setTimeout(r, 50));
      const m = map.current;
      if (dead || !m) return;
      markers.current.forEach((x) => x.remove());
      markers.current.clear();
      for (const p of visible) {
        const st = STYLE[p.location];
        const c = L.circleMarker([p.lat, p.lng], { radius: p.slug === sel ? 11 : 8, color: st.color, fillColor: st.fill, fillOpacity: p.location === "known" ? 0.85 : 0.5, weight: 2, dashArray: st.dash });
        c.bindPopup(`<b>${p.title}</b><br/><span>${p.modern}</span><br/><small>${st.label} · ${p.period}</small><br/><a href="/places/${p.slug}">Open ${p.title}</a>`);
        c.on("click", () => setSel(p.slug));
        c.addTo(m);
        markers.current.set(p.slug, c);
      }
    })();
    return () => { dead = true; };
  }, [visible, sel]);

  useEffect(() => {
    const p = places.find((x) => x.slug === sel);
    if (p && map.current) { map.current.flyTo([p.lat, p.lng], Math.max(map.current.getZoom(), 7), { duration: 0.6 }); markers.current.get(p.slug)?.openPopup(); }
  }, [sel, places]);

  const chosen = places.find((p) => p.slug === sel);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Location certainty">
          {(Object.keys(STYLE) as (keyof typeof STYLE)[]).map((k) => (
            <label key={k} className="chip cursor-pointer m-0" style={{ color: STYLE[k].color }}>
              <input type="checkbox" checked={show[k]} onChange={() => setShow({ ...show, [k]: !show[k] })} style={{ width: 14, height: 14, minHeight: 0 }} />
              {STYLE[k].label}
            </label>
          ))}
        </div>
        <div ref={el} role="application" aria-label="Interactive map of biblical-world places. A list of the same places follows." style={{ height: "min(70vh, 560px)", width: "100%" }} />
        {tilesFailed && <p className="muted text-xs mt-2">The map background could not be loaded, but markers and the place list still work.</p>}
        <p className="muted text-xs mt-2">Ancient place names on a modern basemap. Marker style shows how securely each site is identified; proposed and disputed locations are never drawn as certain.</p>
      </div>
      <aside aria-label="Places" className="card p-3 max-h-[560px] overflow-auto">
        {chosen && (
          <div className="p-3 mb-2 rounded-lg" style={{ background: "rgba(217,173,75,.1)" }}>
            <b className="serif text-lg">{chosen.title}</b>
            <p className="m-0 text-sm muted">{chosen.summary}</p>
            <Link href={`/places/${chosen.slug}`} className="text-sm">Open full page →</Link>
          </div>
        )}
        <ul className="list-none p-0 m-0">
          {visible.map((p) => (
            <li key={p.slug}>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer" aria-current={p.slug === sel} onClick={() => setSel(p.slug)}>
                <span style={{ color: STYLE[p.location].color }} aria-hidden>● </span><b>{p.title}</b><span className="muted text-xs"> · {STYLE[p.location].label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
