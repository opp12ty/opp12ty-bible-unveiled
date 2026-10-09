import { NextResponse } from "next/server";
import { getSettings } from "@/server/settings";

/** Public, cacheable site configuration (navigation visibility, announcement, feature flags). */
export async function GET() {
  const s = await getSettings();
  return NextResponse.json(
    { hidden: s.nav.hidden, announcement: s.home.announcement, flags: s.flags },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
