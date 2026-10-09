import type { Metadata } from "next";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="wrap py-8 max-w-3xl prose-ub">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Privacy" }]} />
      <h1 className="m-0 text-4xl">Privacy</h1>
      <p className="muted">Plain-language summary. A reviewed legal policy should replace this before commercial launch.</p>
      <h2 className="text-2xl">What we store</h2>
      <p><b>On your device:</b> your journey (progress, notes, saved items, preferences, recent searches). It never leaves your device unless you sign in.</p>
      <p><b>If you create an account:</b> your email, name (optional), a salted password hash, your plan, and your synced journey data. We never store your plain password.</p>
      <p><b>Usage counters:</b> anonymous daily counts of events such as page views and searches. No identifiers, IP addresses or search text are stored.</p>
      <p><b>Questions and reports:</b> text you submit, and an optional contact email you choose to give.</p>
      <h2 className="text-2xl">What we do not do</h2>
      <p>We do not sell data, run advertising trackers, or infer your religious beliefs. Personalisation uses only the interests you select, and you can reset it.</p>
      <h2 className="text-2xl">Your controls</h2>
      <p>Export or delete your journey at any time from My Journey. To delete an account and its synced data, use the report form on the Help page and we will remove it.</p>
      <h2 className="text-2xl">Third parties</h2>
      <p>Map tiles are loaded from OpenStreetMap, which receive your IP address when the map is shown. If AI generation is enabled, your question and retrieved passages are sent to the AI provider to produce an answer.</p>
    </div>
  );
}
