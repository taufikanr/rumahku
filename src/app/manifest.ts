import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RumahKu — Sabah's Trusted Rental App",
    short_name: "RumahKu",
    description:
      "Find verified, scam-safe rooms and homes across Sabah. Fair prices, compatible housemates, and a renter trust passport.",
    start_url: "/browse",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e5cad",
    orientation: "portrait",
    categories: ["lifestyle", "business", "shopping"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
