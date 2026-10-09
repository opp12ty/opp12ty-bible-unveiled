import type { Metadata } from "next";
import { byKind, type Place } from "@/content";
import { MapView } from "@/components/MapView";
import { Crumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Interactive Map", description: "Places of the biblical world, marked by how securely each is located." };

export default async function MapPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const places = byKind<Place>("places").map((p) => ({ slug: p.slug, title: p.title, lat: p.lat, lng: p.lng, location: p.location, modern: p.modern, summary: p.summary, period: p.period }));
  return (
    <div className="wrap py-8">
      <Crumbs items={[{ href: "/", label: "Home" }, { label: "Map" }]} />
      <h1 className="m-0 text-4xl">Interactive Map</h1>
      <p className="muted max-w-2xl mt-2 mb-5">Zoom, pan and select a place. Every marker shows how securely the site is identified.</p>
      <MapView places={places} focus={focus} />
    </div>
  );
}
