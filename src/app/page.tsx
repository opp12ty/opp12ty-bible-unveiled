import Link from "next/link";
import { ArrowRight, Compass, Dices, Layers, Map as MapIcon, Search, Sparkles } from "lucide-react";
import { ALL, JOURNEYS, KIND_META, TIMELINE, daily, get, key, mysteryOfWeek, stats, type Entry } from "@/content";
import { getSettings } from "@/server/settings";
import { verseOfTheDay } from "@/server/bible";
import { Art, EntryCard, SectionHead } from "@/components/ui";
import { ContinueCard } from "@/components/ContinueCard";
import { HeroSearch } from "@/components/HeroSearch";

export const revalidate = 60;

export default async function Home() {
  const st = await getSettings();
  const today = daily();
  const mystery = mysteryOfWeek();
  const featured = st.home.featured.map((k) => get(k)).filter(Boolean) as Entry[];
  const oddities = ALL.filter((e) => e.kind === "oddity-vault").slice(0, 3);
  const beliefs = ALL.filter((e) => e.kind === "belief-check").slice(0, 3);
  const objs = ALL.filter((e) => e.kind === "objects").slice(0, 1)[0];
  const votd = verseOfTheDay();
  const n = stats();
  const tl = TIMELINE.filter((t) => t.year > -1300 && t.year < 200).slice(0, 8);

  return (
    <div>
      <section className="hero-glow wrap pt-12 pb-10 sm:pt-20 text-center">
        <div className="chip mx-auto mb-4" style={{ color: "var(--gold-soft)" }}><i className="pulse-dot" aria-hidden />Ancient library · future interface</div>
        <h1 className="m-0 text-4xl sm:text-6xl leading-[1.08] max-w-4xl mx-auto">{st.home.title}</h1>
        <p className="muted text-lg sm:text-xl max-w-2xl mx-auto mt-4 mb-7">{st.home.subtitle}</p>
        <HeroSearch />
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <Link href="/investigations" className="neon neon-cinema no-underline"><Layers size={18} />Enter the investigation</Link>
          <Link href="/oddity-vault" className="neon neon-violet no-underline"><Compass size={18} />Enter the Oddity Vault</Link>
          <Link href="/surprise" className="neon neon-amber no-underline"><Dices size={18} />Surprise me</Link>
          <Link href="/ai" className="neon neon-blue no-underline"><Sparkles size={18} />Ask Unveiled AI</Link>
        </div>
        <p className="muted text-sm mt-6">{n.entries} researched entries · {n.sources} listed sources · {n.links} traceable connections · every claim labelled</p>
      </section>

      <div className="wrap grid gap-12">
        <ContinueCard />

        <section className="grid gap-4 md:grid-cols-2" aria-label="Today">
          <Link href={"/" + key(today)} className="card card-hover no-underline p-5 grid gap-3" style={{ color: "var(--text)" }}>
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>Daily Unseen Discovery</div>
            <Art entry={today} h={110} label={false} />
            <h2 className="m-0 text-2xl">{today.title}</h2>
            <p className="muted m-0">{today.summary}</p>
            <span className="neon neon-gold neon-sm self-start">Go deeper <ArrowRight size={14} /></span>
          </Link>
          <Link href={"/" + key(mystery)} className="card card-hover no-underline p-5 grid gap-3" style={{ color: "var(--text)" }}>
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--violet)" }}>Mystery of the Week</div>
            <Art entry={mystery} h={110} label={false} />
            <h2 className="m-0 text-2xl">{mystery.title}</h2>
            <p className="muted m-0">{mystery.summary}</p>
            <span className="neon neon-violet neon-sm self-start">Investigate <ArrowRight size={14} /></span>
          </Link>
        </section>

        <section>
          <SectionHead eyebrow="Bible Detective" title="Featured investigations" sub="Each case file has layers: choose how deep to go, and see exactly how strong each claim is." action={<Link className="neon neon-ghost neon-sm no-underline" href="/investigations">All cases</Link>} />
          <div className="grid gap-4 md:grid-cols-3">{featured.map((e) => <EntryCard key={key(e)} e={e} />)}</div>
        </section>

        <section>
          <SectionHead eyebrow="Oddity Vault" title="Why did nobody ever teach me this?" sub="Small, strange, well-sourced questions about daily life in the biblical world." action={<Link className="neon neon-violet neon-sm no-underline" href="/oddity-vault">Enter the vault</Link>} />
          <div className="grid gap-4 md:grid-cols-3">{oddities.map((e) => <EntryCard key={key(e)} e={e} />)}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Popular Belief Check" title="Did the Bible actually say that?" />
            <ul className="list-none m-0 p-0 grid gap-3">
              {beliefs.map((b) => (
                <li key={key(b)}><Link href={"/" + key(b)} className="card card-hover block no-underline p-4" style={{ color: "var(--text)" }}><b className="serif text-lg">{b.kind === "belief-check" ? `“${b.claim}”` : b.title}</b><span className="block muted text-sm mt-1">{b.summary}</span></Link></li>
              ))}
            </ul>
            <Link href="/belief-check" className="neon neon-ghost neon-sm no-underline mt-3">See all belief checks</Link>
          </div>
          <div>
            <SectionHead eyebrow="Object Detective" title="What is this?" />
            {objs && (
              <Link href={"/" + key(objs)} className="card card-hover block no-underline p-5" style={{ color: "var(--text)" }}>
                <p className="serif text-xl m-0">{objs.kind === "objects" ? objs.prompt : objs.title}</p>
                <span className="neon neon-emerald neon-sm mt-4">Examine the evidence <ArrowRight size={14} /></span>
              </Link>
            )}
            <div className="card p-5 mt-4">
              <div className="text-xs uppercase tracking-widest muted">Verse of the day · KJV</div>
              <p className="serif text-lg m-0 mt-1">{votd.text}</p>
              <Link href={`/bible/${votd.label.replace(/ \d+:\d+$/, "").toLowerCase().replace(/ /g, "-")}/${votd.chapter}#v${votd.v}`}>{votd.label}</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/map" className="card card-hover no-underline p-6" style={{ color: "var(--text)" }}>
            <MapIcon style={{ color: "var(--blue)" }} /><h2 className="m-0 mt-2 text-2xl">Interactive map</h2>
            <p className="muted m-0">{ALL.filter((e) => e.kind === "places").length} places, each marked known, proposed or disputed.</p>
          </Link>
          <Link href="/timeline" className="card card-hover no-underline p-6" style={{ color: "var(--text)" }}>
            <h2 className="m-0 text-2xl">Timeline</h2>
            <p className="muted m-0 mb-3">From Merneptah to the Dead Sea Scrolls, across six regions.</p>
            <ol className="m-0 pl-0 list-none flex flex-wrap gap-2">{tl.map((t) => <li key={t.id} className="chip">{t.year < 0 ? `${-t.year} BCE` : `${t.year} CE`} · {t.label}</li>)}</ol>
          </Link>
        </section>

        <section>
          <SectionHead eyebrow="Learning journeys" title="Guided paths" action={<Link className="neon neon-ghost neon-sm no-underline" href="/journeys">All journeys</Link>} />
          <div className="grid gap-4 md:grid-cols-3">
            {JOURNEYS.slice(0, 3).map((j) => (
              <Link key={j.slug} href={`/journeys#${j.slug}`} className="card card-hover no-underline p-5" style={{ color: "var(--text)" }}>
                <h3 className="m-0 text-xl">{j.title}</h3><p className="muted text-sm mt-1 mb-2">{j.blurb}</p><span className="chip">{j.steps.length} steps · {j.minutes} min</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-6 grid gap-3 md:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <h2 className="m-0 text-2xl">How we keep this trustworthy</h2>
            <p className="muted m-0 mt-2">Sources are listed. Evidence is classified. Uncertainty is stated. Reconstructions are labelled. AI output is labelled and never presented as a source. Read the method, then check us.</p>
          </div>
          <div className="flex gap-2 flex-wrap md:justify-end">
            <Link href="/method" className="neon neon-gold no-underline">Methodology</Link>
            <Link href="/evidence-lab" className="neon neon-emerald no-underline"><Search size={16} />Evidence Lab</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
