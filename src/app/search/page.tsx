import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = { title: "Search", description: "Search investigations, people, places, archaeology, manuscripts, verses and original-language words." };

export default function SearchPage() {
  return <Suspense fallback={<div className="wrap py-8">Loading search…</div>}><SearchView /></Suspense>;
}
