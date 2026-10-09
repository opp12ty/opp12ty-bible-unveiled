import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BIBLE UNVEILED",
    short_name: "Unveiled",
    description: "Investigate the Bible and the ancient world.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#060a16",
    theme_color: "#060a16",
    categories: ["education", "books"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search", url: "/search" },
      { name: "Surprise me", url: "/surprise" },
      { name: "My Journey", url: "/journey" },
    ],
  };
}
