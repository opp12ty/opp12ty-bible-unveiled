import type { Metadata } from "next";
import Link from "next/link";
import { ALL, KIND_META, get, graph, key, type Kind } from "@/content";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Knowledge Graph", description: "Follow editorial connections between investigations, people, places, finds and manuscripts." };

const COLOR: Record<Kind, string> = {
  investigations: "#d9ad4b", "oddity-vault": "#ae95ff", "belief-check": "#ff7a7a", interpretations: "#f3ab3c", silence: "#a9b4d4",
  archaeology: "#34d6a0", manuscripts: "#f1d58a", objects: "#43b0ff", people: "#ffb3a0", places: "#7fd1ff", "ancient-world": "#c9a3ff",
};

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const center = focus && get(focus) ? focus : "investigations/goliaths-height";
  const g = graph(center, 2);
  const W = 760, H = 560, cx = W / 2, cy = H / 2;
  const ring: Record<number, string[]> = {};
  g.nodes.forEach((n) => (ring[n.ring] ??= []).push(n.id));
  const pos = new Map<string, { x: number; y: number }>();
  pos.set(center, { x: cx, y: cy });
  const R = [0, 150, 245];
  [1, 2].forEach((r) => (ring[r] ?? []).forEach((id, i, a) => {
    const ang = (i / a.length) * Math.PI * 2 - Math.PI / 2 + (r === 2 ? 0.2 : 0);
    pos.set(id, { x: cx + Math.cos(ang) * R[r] * 1.35, y: cy + Math.sin(ang) * R[r] });
  }));
  const node = new Map(g.nodes.map((n) => [n.id, n]));
  const neighbours = g.nodes.filter((n) => n.ring === 1);

  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Knowledge graph" }]} />
      <h1 className="m-0 text-4xl">Knowledge Graph</h1>
      <p className="muted max-w-2xl mt-2">Every line is an editorial connection written by our researchers, not an algorithmic guess. Select any node to re-centre the graph.</p>
      <form method="get" className="flex gap-2 my-4 max-w-xl">
        <label htmlFor="f" className="sr-only">Centre on</label>
        <select id="f" name="focus" defaultValue={center}>
          {ALL.map((e) => <option key={key(e)} value={key(e)}>{KIND_META[e.kind].label}: {e.title}</option>)}
        </select>
        <button className="neon neon-violet" type="submit">Centre</button>
      </form>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card p-2 overflow-auto">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Graph of ${g.nodes.length} connected entries around ${get(center)?.title}. A list of the same connections follows.`}>
            {g.edges.map((e, i) => {
              const a = pos.get(e.a), b = pos.get(e.b);
              return a && b ? <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(160,180,255,.28)" strokeWidth={1.2} /> : null;
            })}
            {g.nodes.map((n) => {
              const p = pos.get(n.id)!;
              const big = n.ring === 0;
              const label = n.title.length > 24 ? n.title.slice(0, 22) + "…" : n.title;
              return (
                <Link key={n.id} href={`/graph?focus=${n.id}`}>
                  <g>
                    <circle cx={p.x} cy={p.y} r={big ? 20 : n.ring === 1 ? 12 : 8} fill="#0a1124" stroke={COLOR[n.kind]} strokeWidth={big ? 3 : 2} />
                    <text x={p.x} y={p.y + (big ? 36 : 26)} textAnchor="middle" fontSize={big ? 13 : 10.5} fill="#eef2ff" style={{ paintOrder: "stroke", stroke: "#060a16", strokeWidth: 3 }}>{label}</text>
                  </g>
                </Link>
              );
            })}
          </svg>
        </div>
        <aside className="card p-4">
          <h2 className="m-0 text-lg">Connected to {get(center)?.title}</h2>
          <ul className="m-0 mt-3 pl-0 list-none grid gap-2 text-sm">
            {neighbours.map((n) => (
              <li key={n.id}><span style={{ color: COLOR[n.kind] }} aria-hidden>● </span><Link href={"/" + n.id}>{n.title}</Link> <span className="muted">· {KIND_META[n.kind].label}</span></li>
            ))}
          </ul>
          <Link href={"/" + center} className="neon neon-gold neon-sm no-underline mt-4">Open {node.get(center)?.title}</Link>
          <div className="mt-4 text-xs muted">{Object.entries(COLOR).map(([k, c]) => <span key={k} className="mr-3 inline-block"><span style={{ color: c }}>●</span> {KIND_META[k as Kind].label}</span>)}</div>
        </aside>
      </div>
    </div>
  );
}
