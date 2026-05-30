import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";

interface AppRow {
  id: string;
  listing_id: string;
  tenant_id: string;
  tenant_name: string;
  message: string;
  status: string;
  created_at: string;
  listing: { title: string } | null;
}

export interface LandlordApplication extends Application {
  listingTitle: string;
}

/** Applications to the signed-in landlord's listings (RLS scopes this automatically). */
export async function getLandlordApplications(): Promise<LandlordApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, listing:listings!applications_listing_id_fkey(title)")
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("getLandlordApplications:", error.message);
    return [];
  }
  return (data as unknown as AppRow[]).map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    tenantId: r.tenant_id,
    tenantName: r.tenant_name,
    message: r.message,
    status: (r.status as Application["status"]) ?? "pending",
    createdAt: r.created_at,
    listingTitle: r.listing?.title ?? "Listing",
  }));
}
