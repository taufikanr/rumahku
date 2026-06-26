import type { AreaId, PropertyType } from "@/lib/constants";
import { computePriceFairness } from "@/lib/pricing";
import { computeScamRisk } from "@/lib/scam";
import { displayPhotos, WALKTHROUGH_VIDEO } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type {
  FurnishLevel,
  GenderPreference,
  Housemate,
  Listing,
  Review,
} from "@/lib/types";

interface LandlordEmbed {
  id: string;
  full_name: string;
  is_verified: boolean;
  rating: number | null;
  review_count: number;
  phone: string | null;
  created_at: string;
}
interface ReviewRow {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
interface ListingRow {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  area_id: string;
  address_line: string | null;
  lat: number | null;
  lng: number | null;
  price: number;
  deposit: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number | null;
  furnished: string;
  gender_preference: string;
  photos: string[] | null;
  walkthrough_url: string | null;
  amenities: string[] | null;
  available_from: string | null;
  current_housemates: Housemate[] | null;
  status: string;
  listed_via: string | null;
  created_at: string;
  landlord: LandlordEmbed | null;
  reviews: ReviewRow[] | null;
}

const SELECT =
  "*, landlord:profiles!listings_landlord_id_fkey(id, full_name, is_verified, rating, review_count, phone, created_at), reviews(id, author_name, rating, comment, created_at)";

function daysSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 86_400_000));
}

function buildFromRow(row: ListingRow): Listing {
  const ll = row.landlord;
  const areaId = row.area_id as AreaId;
  const propertyType = row.property_type as PropertyType;
  const photos = displayPhotos(row.id, row.photos);
  const fairness = computePriceFairness(row.price, areaId, propertyType);
  const scam = computeScamRisk({
    price: row.price,
    expectedPrice: fairness.areaAvg,
    isVerifiedLandlord: ll?.is_verified ?? false,
    photoCount: photos.length,
    description: row.description,
    depositMonths: row.price > 0 ? row.deposit / row.price : 2,
    landlordAgeDays: ll?.created_at ? daysSince(ll.created_at) : 365,
    hasDigitalContract: ll?.is_verified ?? false,
  });
  const reviews: Review[] = (row.reviews ?? []).map((rv) => ({
    id: rv.id,
    authorName: rv.author_name,
    authorRole: "tenant",
    rating: rv.rating,
    comment: rv.comment,
    createdAt: rv.created_at,
  }));
  const rating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : undefined;

  return {
    id: row.id,
    landlordId: row.landlord_id,
    landlord: {
      id: ll?.id ?? row.landlord_id,
      fullName: ll?.full_name ?? "Landlord",
      isVerified: ll?.is_verified ?? false,
      rating: ll?.rating ?? undefined,
      reviewCount: ll?.review_count ?? 0,
      phone: ll?.phone ?? "",
      joinedAt: ll?.created_at ?? row.created_at,
    },
    title: row.title,
    description: row.description,
    areaId,
    addressLine: row.address_line ?? "",
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    price: row.price,
    deposit: row.deposit,
    propertyType,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sizeSqft: row.size_sqft ?? undefined,
    furnished: row.furnished as FurnishLevel,
    genderPreference: row.gender_preference as GenderPreference,
    photos,
    walkthroughUrl: WALKTHROUGH_VIDEO,
    amenities: row.amenities ?? [],
    availableFrom: row.available_from ?? row.created_at,
    currentHousemates: row.current_housemates ?? [],
    reviews,
    rating,
    isVerified: ll?.is_verified ?? false,
    scam,
    status: row.status === "rented" ? "rented" : "active",
    listedVia: row.listed_via ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchAllListings(): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(SELECT);
  if (error || !data) {
    if (error) console.error("fetchAllListings:", error.message);
    return [];
  }
  return (data as unknown as ListingRow[]).map(buildFromRow);
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return buildFromRow(data as unknown as ListingRow);
}

export async function fetchLandlordListings(landlordId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("landlord_id", landlordId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as ListingRow[]).map(buildFromRow);
}
