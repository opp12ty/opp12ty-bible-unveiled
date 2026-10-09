import type { Metadata } from "next";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Accessibility" };

export default function A11y() {
  return (
    <div className="wrap py-8 max-w-3xl prose-ub">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Accessibility" }]} />
      <h1 className="m-0 text-4xl">Accessibility statement</h1>
      <p>We aim for WCAG 2.2 level AA. Current measures: semantic landmarks and headings, a skip link, full keyboard operation, visible focus rings, 44 px touch targets, status conveyed with words and symbols as well as colour, text alternatives for interactive visuals (the map and graph each have an equivalent list), and reduced-motion support.</p>
      <p><b>Known gaps:</b> the map relies on a third-party tile layer; automated and manual audits with assistive technology have not yet been completed. Please report barriers through the Help page and we will prioritise fixes.</p>
    </div>
  );
}
