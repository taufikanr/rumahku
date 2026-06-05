import { AREA_BY_ID, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { getListings, type ListingFilters } from "@/lib/data";
import { formatRM } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export interface SavedSearch {
  id: string;
  label: string;
  query: ListingFilters;
  notify: boolean;
  createdAt: string;
  /** Listings matching the saved filters right now. */
  matchCount: number;
  /** Of those, how many were posted after the search was saved. */
  newCount: number;
}

/** Human-readable summary of a set of filters, for default labels + display. */
export function describeQuery(q: ListingFilters): string {
  const parts: string[] = [];
  parts.push(q.type ? PROPERTY_TYPE_LABEL[q.type] : "Rooms & homes");
  if (q.area) parts.push(`in ${AREA_BY_ID[q.area]?.name ?? q.area}`);
  if (q.maxPrice) parts.push(`under ${formatRM(q.maxPrice)}`);
  else if (q.minPrice) parts.push(`from ${formatRM(q.minPrice)}`);
  if (q.gender && q.gender !== "any") parts.push(`· ${q.gender}`);
  if (q.maxDistanceKm) parts.push(`· ≤${q.maxDistanceKm}km to UMS`);
  if (q.safeOnly) parts.push("· scam-safe");
  if (q.verifiedOnly) parts.push("· verified");
  if (q.q) parts.push(`· “${q.q}”`);
  return parts.join(" ");
}

/** Build a query string for /browse from saved filters. */
export function queryToHref(q: ListingFilters): string {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.area) p.set("area", q.area);
  if (q.type) p.set("type", q.type);
  if (q.minPrice != null) p.set("min", String(q.minPrice));
  if (q.maxPrice != null) p.set("max", String(q.maxPrice));
  if (q.gender) p.set("gender", q.gender);
  if (q.maxDistanceKm != null) p.set("maxKm", String(q.maxDistanceKm));
  if (q.safeOnly) p.set("safe", "1");
  if (q.verifiedOnly) p.set("verified", "1");
  if (q.sort) p.set("sort", q.sort);
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

interface Row {
  id: string;
  label: string;
  query: ListingFilters | null;
  notify: boolean;
  created_at: string;
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, label, query, notify, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("getSavedSearches:", error.message);
    return [];
  }

  const rows = data as Row[];
  return Promise.all(
    rows.map(async (r) => {
      const query = (r.query ?? {}) as ListingFilters;
      const matches = await getListings({ filters: query });
      const newCount = matches.filter((m) => Date.parse(m.createdAt) > Date.parse(r.created_at)).length;
      return {
        id: r.id,
        label: r.label,
        query,
        notify: r.notify,
        createdAt: r.created_at,
        matchCount: matches.length,
        newCount,
      };
    }),
  );
}
