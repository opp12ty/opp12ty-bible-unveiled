import type { Metadata } from "next";
import { byKind, key, type Oddity } from "@/content";
import { WaitWhat, type WWCard } from "@/components/WaitWhat";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Wait… What?", description: "Reveal surprising, sourced findings one step at a time." };

export default function WaitWhatPage() {
  const cards: WWCard[] = byKind<Oddity>("oddity-vault").map((o) => ({
    k: key(o),
    title: o.title,
    question: o.question,
    steps: [
      { label: "The discovery", text: o.summary },
      { label: "The explanation", text: o.explanation.join(" ") },
      { label: "The historical setting", text: o.context },
      { label: "The evidence", text: o.evidence },
      ...(o.bible ? [{ label: "The biblical connection", text: o.bible }] : []),
      { label: "The uncertainty", text: o.uncertainties },
    ],
  }));
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Wait… what?" }]} />
      <h1 className="m-0 text-4xl mb-6">Wait… What?</h1>
      <WaitWhat cards={cards} />
    </div>
  );
}
