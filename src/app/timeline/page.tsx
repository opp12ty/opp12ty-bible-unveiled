import type { Metadata } from "next";
import { TIMELINE } from "@/content";
import { TimelineView } from "@/components/TimelineView";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Timeline", description: "Events of the biblical world across Israel, Egypt, Mesopotamia, Persia, Greece and Rome, with confidence labels." };

export default function TimelinePage() {
  return (
    <div className="wrap py-8 max-w-4xl">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Timeline" }]} />
      <h1 className="m-0 text-4xl">Timeline</h1>
      <p className="muted mt-2 mb-6">Filter by period and region. Not every region is equally documented, and neighbouring events are not necessarily connected: placing them side by side shows context, not causation.</p>
      <TimelineView events={TIMELINE} />
    </div>
  );
}
