import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Methodology", description: "How BIBLE UNVEILED selects sources, evaluates claims, represents interpretations, labels reconstructions and uses AI." };

const H = ({ id, children }: { id: string; children: string }) => <h2 id={id} className="text-2xl m-0 mt-8 mb-2">{children}</h2>;

export default function Method() {
  return (
    <div className="wrap py-8 max-w-3xl prose-ub">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Methodology" }]} />
      <h1 className="m-0 text-4xl">Methodology &amp; Trust</h1>
      <p className="muted mt-2">We don&apos;t tell you what to think. We give you the tools to investigate. This page says how we work, so you can check us.</p>

      <H id="sources">How sources are selected</H>
      <p>We prefer primary witnesses (inscriptions, manuscripts, ancient authors, excavation reports, museum catalogues) and standard scholarly works. Every entry lists its sources, and the <Link href="/sources">Source Library</Link> shows where each is used. We cite only works that exist and do not use a source to support a claim it does not make.</p>

      <H id="claims">How claims are evaluated</H>
      <p>Each claim is classified by <b>kind of evidence</b> and by <b>confidence</b> (documented, well supported, likely, debated, unknown). We describe what was found, how it was dated, what researchers infer, and how direct the biblical connection is. The <Link href="/evidence-lab">Evidence Lab</Link> defines every label. We do not use truth percentages.</p>

      <H id="interpretations">How interpretations are represented</H>
      <p>Major positions are shown fairly and in proportion, with support and objections. We say when a position is a religious tradition, a scholarly proposal, an individual view or a hypothesis. We do not manufacture balance where evidence is lopsided, and we do not treat a popular claim as equal to a carefully supported one.</p>

      <H id="uncertainty">How uncertainty is communicated</H>
      <p>Uncertainty is stated on the page, not hidden in footnotes. Where the text is silent we say so, and never fill a gap with an invented answer.</p>

      <H id="visuals">How reconstructions and images are labelled</H>
      <p>Every visual carries a label: authentic photograph, historical illustration, digital reconstruction, AI-generated visual, artistic interpretation or schematic diagram. Generated scenes are never labelled as authentic photographs. The artwork currently used on this site is schematic and generated; it does not depict verified artefacts.</p>

      <H id="ai">How AI is used</H>
      <p><Link href="/ai">Unveiled AI</Link> retrieves passages from our reviewed material and Scripture, then (when enabled) asks a language model to summarise only that material with numbered citations. If generation is not enabled, it returns a research brief assembled from the material, with nothing written by a model. AI output is always labelled, can be wrong, and is not a source. AI-adapted content is never published without editorial approval.</p>

      <H id="corrections">How corrections are handled</H>
      <p>Anyone can <Link href="/help#report">report a possible error</Link> from any page. Editors review each report, and significant corrections are recorded rather than silently erased.</p>

      <H id="commercial">Commercial disclosure</H>
      <p>Memberships are planned to fund research and hosting. Paid access never changes what the evidence says. Sponsorships, if ever accepted, will be disclosed on the page.</p>

      <H id="limits">Current limitations</H>
      <p>This is an early release. Source citations are at the level of the work. Content is English only. Page-level citations, specialist peer review, licensed photography and 3D reconstructions are on the roadmap, visible to administrators.</p>
    </div>
  );
}
