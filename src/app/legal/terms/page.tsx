import type { Metadata } from "next";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <div className="wrap py-8 max-w-3xl prose-ub">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Terms" }]} />
      <h1 className="m-0 text-4xl">Terms of use</h1>
      <p className="muted">Plain-language summary. A reviewed legal document should replace this before commercial launch.</p>
      <p>BIBLE UNVEILED is an educational platform. Content is provided for learning and research and is not professional, legal or pastoral advice.</p>
      <p>Be respectful. Do not post unlawful, abusive or deceptive content, attempt to disrupt the service, or scrape it at a rate that harms other users. Submitted questions and reports may be moderated, edited for clarity, or removed.</p>
      <p>The original editorial content is © PreciousPs. Scripture texts used are in the public domain. Third-party works are cited, not reproduced.</p>
      <p>AI answers are generated from platform material and may be wrong. Do not rely on them as a sole source.</p>
      <p>Paid access, where offered, is described on the Membership page. We may change features and plans, and will describe material changes clearly.</p>
    </div>
  );
}
