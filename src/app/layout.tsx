import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JourneyProvider } from "@/lib/journey";
import { Header, MobileNav } from "@/components/Header";
import { Footer } from "@/components/ui";
import { PwaRegister } from "@/components/PwaRegister";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://bible-unveiled.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "BIBLE UNVEILED — Investigate the Bible and the Ancient World", template: "%s · BIBLE UNVEILED" },
  description: "An interactive Bible investigation platform: case files, archaeology, manuscripts, original languages, maps, timelines and a source-grounded AI research assistant. We give you the tools to investigate.",
  applicationName: "BIBLE UNVEILED",
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", siteName: "BIBLE UNVEILED", title: "BIBLE UNVEILED", description: "You don't just read the Bible. You investigate it." },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = { themeColor: "#060a16", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <JourneyProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileNav />
          <PwaRegister />
        </JourneyProvider>
      </body>
    </html>
  );
}
