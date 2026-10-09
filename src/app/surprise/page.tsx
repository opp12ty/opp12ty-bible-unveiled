import type { Metadata } from "next";
import { ALL, KIND_META, key } from "@/content";
import { Surprise } from "@/components/Surprise";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Surprise Me", description: "A random, sourced discovery matched loosely to your interests." };

export default function SurprisePage() {
  const items = ALL.filter((e) => !e.premium).map((e) => ({ k: key(e), title: e.title, summary: e.summary, kindLabel: KIND_META[e.kind].label, tags: e.tags }));
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Surprise me" }]} />
      <h1 className="m-0 text-4xl mb-6">Surprise Me</h1>
      <Surprise items={items} />
    </div>
  );
}
