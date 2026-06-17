import { AREAS, LANDMARKS, type AreaId, type PropertyType } from "@/lib/constants";
import { distanceKm, estDriveMins } from "@/lib/geo";
import { computeHousemateMatch } from "@/lib/match";
import { computePriceFairness } from "@/lib/pricing";
import { computeScamRisk } from "@/lib/scam";
import {
  DEMO_TENANT,
  LANDLORD_BY_ID,
  RAW_LISTINGS,
  landlordAgeDays,
  type RawListing,
} from "@/lib/seed";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchAllListings,
  fetchLandlordListings,
  fetchListing,
} from "@/lib/data-db";
import { getListingVerification } from "@/lib/verification";
import type {
  EnrichedListing,
  GenderPreference,
  LifestyleHabits,
  Listing,
  Profile,
  ScamLevel,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Build canonical listings (compute scam score once)                 */
/* ------------------------------------------------------------------ */
function buildListing(raw: RawListing): Listing {
  const landlord = LANDLORD_BY_ID[raw.landlordId];
  const fairness = computePriceFairness(raw.price, raw.areaId, raw.propertyType);
  const scam = computeScamRisk({
    price: raw.price,
    expectedPrice: fairness.areaAvg,
    isVerifiedLandlord: landlord?.isVerified ?? false,
    photoCount: raw.photos.length,
    description: raw.description,
    depositMonths: raw.price > 0 ? raw.deposit / raw.price : 2,
    landlordAgeDays: landlordAgeDays(raw.landlordId),
    hasDigitalContract: landlord?.isVerified ?? false,
  });
  const rating =
    raw.reviews.length > 0
      ? Math.round(
          (raw.reviews.reduce((s, r) => s + r.rating, 0) / raw.reviews.length) * 10,
        ) / 10
      : undefined;

  return {
    ...raw,
    landlord: {
      id: landlord.id,
      fullName: landlord.fullName,
      avatarUrl: landlord.avatarUrl,
      isVerified: landlord.isVerified,
      rating: landlord.rating,
      reviewCount: landlord.reviewCount,
      phone: landlord.phone,
      joinedAt: landlord.joinedAt,
    },
    isVerified: landlord?.isVerified ?? false,
    rating,
    scam,
  };
}

const LISTINGS: Listing[] = RAW_LISTINGS.map(buildListing);
const LISTING_BY_ID: Record<string, Listing> = Object.fromEntries(
  LISTINGS.map((l) => [l.id, l]),
);

/* ------------------------------------------------------------------ */
/* Enrichment (context-dependent values)                              */
/* ------------------------------------------------------------------ */
export interface EnrichContext {
  reference?: { lat: number; lng: number };
  userHabits?: LifestyleHabits;
}

export function enrich(listing: Listing, ctx: EnrichContext = {}): EnrichedListing {
  const reference = ctx.reference ?? LANDMARKS.ums;
  const d = distanceKm(reference, { lat: listing.lat, lng: listing.lng });
  return {
    ...listing,
    distanceKm: Math.round(d * 10) / 10,
    driveMins: estDriveMins(d),
    price_fairness: computePriceFairness(
      listing.price,
      listing.areaId,
      listing.propertyType,
    ),
    housemateMatch: ctx.userHabits
      ? computeHousemateMatch(ctx.userHabits, listing.currentHousemates)
      : undefined,
    verification: getListingVerification(listing),
  };
}

/* ------------------------------------------------------------------ */
/* Filtering + sorting                                                */
/* ------------------------------------------------------------------ */
export type SortKey =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "distance"
  | "newest"
  | "match";

export interface ListingFilters {
  q?: string;
  area?: AreaId;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  gender?: GenderPreference;
  maxDistanceKm?: number;
  safeOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: SortKey;
}

const SCAM_RANK: Record<ScamLevel, number> = { safe: 0, caution: 1, high: 2 };

function matchesFilters(l: EnrichedListing, f: ListingFilters): boolean {
  if (l.status !== "active") return false;
  if (f.q) {
    const hay = `${l.title} ${l.description} ${l.addressLine}`.toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  if (f.area && l.areaId !== f.area) return false;
  if (f.type && l.propertyType !== f.type) return false;
  if (f.minPrice != null && l.price < f.minPrice) return false;
  if (f.maxPrice != null && l.price > f.maxPrice) return false;
  if (f.gender && f.gender !== "any") {
    if (l.genderPreference !== "any" && l.genderPreference !== f.gender) return false;
  }
  if (f.maxDistanceKm != null && l.distanceKm > f.maxDistanceKm) return false;
  if (f.safeOnly && l.scam.level === "high") return false;
  if (f.verifiedOnly && !l.isVerified) return false;
  return true;
}

function sortListings(list: EnrichedListing[], sort: SortKey): EnrichedListing[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "distance":
      return arr.sort((a, b) => a.distanceKm - b.distanceKm);
    case "newest":
      return arr.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    case "match":
      return arr.sort((a, b) => (b.housemateMatch ?? -1) - (a.housemateMatch ?? -1));
    case "recommended":
    default:
      // Verified + safe + fairly priced + closer rise to the top.
      return arr.sort((a, b) => recommendScore(b) - recommendScore(a));
  }
}

function recommendScore(l: EnrichedListing): number {
  let s = 0;
  if (l.isVerified) s += 30;
  if (l.verification.status === "verified") s += 14;
  s += (2 - SCAM_RANK[l.scam.level]) * 20; // safe best
  if (l.price_fairness.verdict === "below") s += 12;
  else if (l.price_fairness.verdict === "fair") s += 6;
  s += Math.max(0, 20 - l.distanceKm); // closer to UMS is better
  s += (l.rating ?? 0) * 2;
  return s;
}

/* ------------------------------------------------------------------ */
/* Public API (async — DB-swap-ready)                                 */
/* ------------------------------------------------------------------ */
export interface GetListingsOptions extends EnrichContext {
  filters?: ListingFilters;
}

export async function getListings(
  opts: GetListingsOptions = {},
): Promise<EnrichedListing[]> {
  const { filters = {}, ...ctx } = opts;
  const source = isSupabaseConfigured ? await fetchAllListings() : LISTINGS;
  const enriched = source.map((l) => enrich(l, ctx));
  const filtered = enriched.filter((l) => matchesFilters(l, filters));
  return sortListings(filtered, filters.sort ?? "recommended");
}

export async function getListingById(
  id: string,
  ctx: EnrichContext = {},
): Promise<EnrichedListing | null> {
  const listing = isSupabaseConfigured
    ? await fetchListing(id)
    : (LISTING_BY_ID[id] ?? null);
  return listing ? enrich(listing, ctx) : null;
}

export async function getFeaturedListings(
  count = 6,
  ctx: EnrichContext = {},
): Promise<EnrichedListing[]> {
  const all = await getListings({ ...ctx, filters: { safeOnly: true, sort: "recommended" } });
  return all.slice(0, count);
}

export async function getLandlordListings(landlordId: string): Promise<Listing[]> {
  if (isSupabaseConfigured) return fetchLandlordListings(landlordId);
  return LISTINGS.filter((l) => l.landlordId === landlordId);
}

export function getLandlord(id: string): Profile | null {
  return LANDLORD_BY_ID[id] ?? null;
}

export function getDemoTenant(): Profile {
  return DEMO_TENANT;
}

/** Areas with active-listing counts, for filter UIs. */
export function listAreasWithCounts(): { id: AreaId; name: string; count: number }[] {
  return AREAS.map((a) => ({
    id: a.id,
    name: a.name,
    count: LISTINGS.filter((l) => l.areaId === a.id && l.status === "active").length,
  }));
}
