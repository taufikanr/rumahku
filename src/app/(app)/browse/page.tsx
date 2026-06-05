import { Suspense } from "react";
import Link from "next/link";
import { Bell, LayoutGrid, MapPin, SearchX } from "lucide-react";
import { saveSearchAction } from "@/app/(app)/alerts/actions";
import {
  AREA_BY_ID,
  PROPERTY_TYPE_LABEL,
  type AreaId,
  type PropertyType,
} from "@/lib/constants";
import {
  getDemoTenant,
  getListings,
  listAreasWithCounts,
  type ListingFilters,
  type SortKey,
} from "@/lib/data";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingFilters as Filters } from "@/components/listing/listing-filters";
import { ListingsMap } from "@/components/listing/listings-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Browse rooms in Sabah" };

type SearchParams = { [key: string]: string | string[] | undefined };

const SORT_KEYS: SortKey[] = [
  "recommended",
  "price-asc",
  "price-desc",
  "distance",
  "newest",
  "match",
];

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseFilters(sp: SearchParams): ListingFilters {
  const area = str(sp.area) as AreaId | undefined;
  const type = str(sp.type) as PropertyType | undefined;
  const gender = str(sp.gender);
  const sort = str(sp.sort) as SortKey | undefined;
  return {
    q: str(sp.q),
    area: area && AREA_BY_ID[area] ? area : undefined,
    type: type && PROPERTY_TYPE_LABEL[type] ? type : undefined,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    gender: gender === "male" || gender === "female" ? gender : undefined,
    maxDistanceKm: num(sp.maxKm),
    safeOnly: str(sp.safe) === "1",
    verifiedOnly: str(sp.verified) === "1",
    sort: sort && SORT_KEYS.includes(sort) ? sort : undefined,
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const tenant = getDemoTenant();
  const listings = await getListings({ filters, userHabits: tenant.habits });
  const areas = listAreasWithCounts();

  const view = str(sp.view) === "map" ? "map" : "list";
  // Toggle links that preserve the active filters.
  const qs = (v: "list" | "map") => {
    const params = new URLSearchParams();
    for (const [k, val] of Object.entries(sp)) {
      const s = str(val);
      if (k !== "view" && s) params.set(k, s);
    }
    if (v === "map") params.set("view", "map");
    const q = params.toString();
    return q ? `/browse?${q}` : "/browse";
  };
  const mapListings = listings.map((l) => ({
    id: l.id,
    title: l.title,
    areaName: AREA_BY_ID[l.areaId].name,
    lat: l.lat,
    lng: l.lng,
    price: l.price,
    scamLevel: l.scam.level,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Rooms &amp; homes in Kota Kinabalu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every listing is scam-checked and shows its distance to UMS. Browse with confidence.
        </p>
      </div>

      <Suspense>
        <Filters areas={areas} />
      </Suspense>

      <div className="mt-5 mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{listings.length}</span>{" "}
          {listings.length === 1 ? "home" : "homes"} found
        </p>
        <div className="flex items-center gap-2">
        <form action={saveSearchAction}>
          <input type="hidden" name="query" value={JSON.stringify(filters)} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-4" /> Save search
          </button>
        </form>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
          <Link
            href={qs("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" /> List
          </Link>
          <Link
            href={qs("map")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium",
              view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MapPin className="size-4" /> Map
          </Link>
        </div>
        </div>
      </div>

      {view === "map" && listings.length > 0 ? (
        <ListingsMap listings={mapListings} />
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <h2 className="mt-4 font-heading text-lg font-bold">No homes match your filters</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try widening your price range, distance, or clearing some filters.
          </p>
          <Button className="mt-4" render={<Link href="/browse" />} nativeButton={false}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
