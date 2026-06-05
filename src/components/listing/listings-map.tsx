"use client";

import dynamic from "next/dynamic";
import type { MapListing } from "@/components/listing/map-inner";

// Leaflet touches `window`, so the map must never server-render.
const MapInner = dynamic(() => import("@/components/listing/map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-border/70">
      <MapInner listings={listings} />
    </div>
  );
}
