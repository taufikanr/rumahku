"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSavedIds } from "@/lib/saved";
import { ListingCard } from "@/components/listing/listing-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import type { EnrichedListing } from "@/lib/types";

export function SavedListings({ listings }: { listings: EnrichedListing[] }) {
  const ids = useSavedIds();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  const saved = listings.filter((l) => ids.includes(l.id));

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <Heart className="size-10 text-muted-foreground" />
        <h2 className="mt-4 font-heading text-lg font-bold">No saved homes yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Tap the ❤️ on any listing to keep it here for later.
        </p>
        <ButtonLink href="/browse" className="mt-4">
          Browse rooms
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
