import type { Metadata } from "next";
import { ALL, key } from "@/content";
import { JourneyDashboard } from "@/components/JourneyDashboard";

export const metadata: Metadata = { title: "My Journey", description: "Your progress, notes, saved items, badges and preferences." };

export default function JourneyPage() {
  const titles = Object.fromEntries(ALL.map((e) => [key(e), e.title]));
  return <JourneyDashboard titles={titles} />;
}
