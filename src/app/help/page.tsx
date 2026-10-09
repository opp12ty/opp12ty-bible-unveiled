import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/ui";
import { ReportError } from "@/components/bits";

export const metadata: Metadata = { title: "Help & Support", description: "FAQ, installing the app, accessibility, AI limitations and how to report errors." };

const FAQ: [string, string][] = [
  ["Do I need an account?", "No. Every feature works without one; your progress is saved on your device. An account adds sync across devices."],
  ["Can I install it on my phone?", "Yes. On Android Chrome use “Install app” or “Add to Home screen”. On iPhone, open the Share menu in Safari and choose “Add to Home Screen”. It is a web app, not a store app."],
  ["Does it work offline?", "Pages you have already opened and the app shell are cached. Search, AI and sync need a connection."],
  ["Is the AI reliable?", "It answers only from our reviewed material and Scripture, with citations, and can still be wrong. Treat it as a guide to the pages, not as a source."],
  ["Which Bible translations are included?", "KJV (with Strong's numbers), Berean Standard Bible, ASV, the Westminster Leningrad Codex (Hebrew) and the Textus Receptus (Greek). All are public domain."],
  ["How are paid plans handled?", "See Membership. We state clearly what is free and what is paid."],
  ["What languages are supported?", "English now. The interface is built for right-to-left and additional languages, but we will not list a language until it is fully translated and reviewed."],
];

export default function Help() {
  return (
    <div className="wrap py-8 max-w-3xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Help" }]} />
      <h1 className="m-0 text-4xl">Help &amp; Support</h1>
      <div className="grid gap-3 mt-6">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card p-4"><summary className="font-semibold cursor-pointer">{q}</summary><p className="m-0 mt-2">{a}</p></details>
        ))}
      </div>
      <h2 id="report" className="text-2xl mt-10 mb-2">Report an error</h2>
      <p className="muted m-0">Spotted a factual error, a weak citation or a broken link? Every page has a report button; you can also report a general problem here. Read <Link href="/method#corrections">how corrections work</Link>.</p>
      <ReportError path="/help" />
      <h2 id="plans" className="text-2xl mt-10 mb-2">Plans and billing</h2>
      <p className="muted">Paid plans are not open for self-service yet. See <Link href="/pricing">Membership</Link> for what is planned.</p>
      <h2 className="text-2xl mt-8 mb-2">Accessibility</h2>
      <p className="muted">We aim for WCAG 2.2 AA: keyboard navigation, visible focus, text alternatives, reduced-motion support and status that never relies on colour alone. <Link href="/legal/accessibility">Accessibility statement</Link>.</p>
    </div>
  );
}
