import type { Metadata } from "next";
import Link from "next/link";
import { NAV } from "@/lib/nav";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Explore", description: "Everything on BIBLE UNVEILED in one place." };

export default function Explore() {
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Explore" }]} />
      <h1 className="m-0 text-4xl mb-6">Explore</h1>
      {NAV.map((g) => (
        <section key={g.id} className="mb-8">
          <h2 className="text-2xl m-0 mb-3">{g.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} className="card card-hover no-underline p-4" style={{ color: "var(--text)" }}>
                <b className="serif text-lg">{i.label}</b><span className="block muted text-sm">{i.desc}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
