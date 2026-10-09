"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass, Home, Menu, Search, Sparkles, UserRound, X } from "lucide-react";
import { NAV } from "@/lib/nav";
import { levelFor, useJourney } from "@/lib/journey";

interface Cfg { hidden: string[]; announcement: string; flags: Record<string, boolean> }

export function Logo({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-wide whitespace-nowrap">
      <svg width={small ? 24 : 30} height={small ? 24 : 30} viewBox="0 0 32 32" aria-hidden>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1d58a" /><stop offset="1" stopColor="#d9ad4b" /></linearGradient></defs>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#lg)" strokeWidth="1.6" />
        <path d="M9 22V10.5c3-1.4 5.3-1 7 .8 1.700-1.800 4-2.200 7-.8V22c-3-1.300-5.300-.900-7 .900C14.300 21.100 12 20.700 9 22Z" fill="none" stroke="url(#lg)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 11.300V23" stroke="url(#lg)" strokeWidth="1.300" />
        <circle cx="23.500" cy="8.500" r="2" fill="#43b0ff" />
      </svg>
      <span className="serif text-lg" style={{ color: "var(--gold-soft)" }}>BIBLE <span style={{ color: "var(--text)" }}>UNVEILED</span></span>
    </span>
  );
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<Cfg>({ hidden: [], announcement: "", flags: {} });
  const { s, ready } = useJourney();
  const lvl = levelFor(s.xp);

  useEffect(() => {
    fetch("/api/config").then((r) => (r.ok ? r.json() : null)).then((c) => c && setCfg(c)).catch(() => {});
  }, []);
  useEffect(() => setOpen(false), [path]);

  const visible = (href: string, flag?: string) => !cfg.hidden.includes(href) && !(flag && cfg.flags[flag] === false);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {cfg.announcement && (
        <div role="status" className="text-center text-sm py-1.5 px-3" style={{ background: "rgba(217,173,75,.16)", borderBottom: "1px solid var(--line)" }}>
          {cfg.announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 backdrop-blur" style={{ background: "rgba(6,10,22,.82)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap flex items-center gap-3 h-16">
          <Link href="/" aria-label="BIBLE UNVEILED home" className="no-underline" style={{ color: "inherit" }}><Logo /></Link>
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 ml-4">
            {NAV.slice(0, 5).map((g) => (
              <div key={g.id} className="relative group">
                <button className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 focus-visible:bg-white/5" aria-haspopup="true">{g.label}</button>
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block w-[22rem]">
                  <ul className="card p-2 m-0 list-none">
                    {g.items.filter((i) => visible(i.href, i.flag)).map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className="block rounded-lg px-3 py-2 no-underline hover:bg-white/5" style={{ color: "var(--text)" }}>
                          <span className="font-semibold">{i.label}</span>
                          <span className="block text-xs muted">{i.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {visible("/vault", "vault") && <Link href="/vault" className="px-3 py-2 rounded-lg text-sm font-medium no-underline hover:bg-white/5" style={{ color: "var(--gold-soft)" }}>The Vault</Link>}
          </nav>
          <div className="flex-1" />
          <Link href="/search" className="neon neon-ghost neon-sm no-underline" aria-label="Search"><Search size={16} /><span className="hidden sm:inline">Search</span></Link>
          {visible("/ai", "ai") && <Link href="/ai" className="neon neon-blue neon-sm no-underline hidden sm:inline-flex whitespace-nowrap"><Sparkles size={16} />Ask Unveiled AI</Link>}
          <Link href="/journey" className="neon neon-sm neon-gold no-underline hidden md:inline-flex whitespace-nowrap" aria-label="My Journey">
            <UserRound size={16} />{ready ? lvl.name : "My Journey"}{ready && <span className="muted font-normal">· {s.xp} XP</span>}
          </Link>
          <button className="lg:hidden neon neon-ghost neon-sm" aria-expanded={open} aria-controls="drawer" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      {open && (
        <div id="drawer" className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-30 overflow-auto p-4" style={{ background: "var(--navy-950)" }}>
          {NAV.map((g) => (
            <section key={g.id} className="mb-5">
              <h2 className="text-sm uppercase tracking-widest muted m-0 mb-2" style={{ fontFamily: "var(--sans)" }}>{g.label}</h2>
              <ul className="list-none p-0 m-0 grid gap-1">
                {g.items.filter((i) => visible(i.href, i.flag)).map((i) => (
                  <li key={i.href}><Link href={i.href} className="block card px-3 py-2 no-underline" style={{ color: "var(--text)" }}><b>{i.label}</b><span className="block text-xs muted">{i.desc}</span></Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export function MobileNav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/explore", label: "Explore", Icon: Compass },
    { href: "/search", label: "Search", Icon: Search },
    { href: "/ai", label: "Ask AI", Icon: Sparkles },
    { href: "/journey", label: "Journey", Icon: UserRound },
  ];
  return (
    <nav aria-label="Mobile" className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5" style={{ background: "rgba(6,10,22,.94)", borderTop: "1px solid var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(({ href, label, Icon }) => {
        const on = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className="flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] no-underline" style={{ color: on ? "var(--gold-soft)" : "var(--muted)", minHeight: 56 }}>
            <Icon size={20} />{label}
          </Link>
        );
      })}
    </nav>
  );
}
