import Link from "next/link";
import { Bath, BedDouble, MapPin, Star } from "lucide-react";
import { AREA_BY_ID, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { distanceLabel, formatRM } from "@/lib/format";
import type { EnrichedListing } from "@/lib/types";
import { ListingImage } from "@/components/listing/listing-image";
import {
  MatchBadge,
  PriceBadge,
  ScamBadge,
  VerifiedBadge,
  VerifiedRealBadge,
} from "@/components/listing/listing-badges";
import { SaveButton } from "@/components/listing/save-button";

export function ListingCard({ listing }: { listing: EnrichedListing }) {
  const area = AREA_BY_ID[listing.areaId];
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      {/* Stretched link makes the whole card clickable (valid HTML — no nested anchors).
          Sits above the card content (z-10); interactive controls like Save sit above it (z-20). */}
      <Link
        href={`/listing/${listing.id}`}
        aria-label={listing.title}
        className="absolute inset-0 z-10"
      />

      <div className="relative overflow-hidden">
        <ListingImage
          seed={listing.photos[0] ?? listing.id}
          type={listing.propertyType}
          className="h-52 w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
          {listing.verification.status === "verified" && <VerifiedRealBadge solid />}
          {listing.isVerified && <VerifiedBadge solid />}
        </div>
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
          <span className="pointer-events-none">
            <ScamBadge level={listing.scam.level} solid />
          </span>
          <SaveButton id={listing.id} />
        </div>
        <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur">
          {PROPERTY_TYPE_LABEL[listing.propertyType]}
        </span>
      </div>

      <div className="relative z-0 flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-heading text-base font-bold leading-snug">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {area.name} · {distanceLabel(listing.distanceKm)} to UMS
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriceBadge fairness={listing.price_fairness} />
          {listing.housemateMatch != null && <MatchBadge score={listing.housemateMatch} />}
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="size-3.5" />
              {listing.bedrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="size-3.5" />
              {listing.bathrooms}
            </span>
            {listing.rating != null && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-premium text-premium" />
                {listing.rating}
              </span>
            )}
          </div>
          <p className="font-heading text-xl font-extrabold">
            {formatRM(listing.price)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
      </div>
    </div>
  );
}
