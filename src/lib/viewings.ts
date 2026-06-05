import { createClient } from "@/lib/supabase/server";

export type ViewingStatus = "pending" | "confirmed" | "declined";

export interface Viewing {
  id: string;
  listingId: string;
  listingTitle: string;
  otherName: string;
  preferredAt: string;
  note: string | null;
  status: ViewingStatus;
  iAmLandlord: boolean;
  createdAt: string;
}

export const VIEWING_STATUS_LABEL: Record<ViewingStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  declined: "Declined",
};

interface Row {
  id: string;
  listing_id: string;
  listing_title: string | null;
  tenant_id: string;
  landlord_id: string;
  preferred_at: string;
  note: string | null;
  status: string;
  created_at: string;
  tenant: { full_name: string } | null;
  landlord: { full_name: string } | null;
}

const SELECT =
  "id, listing_id, listing_title, tenant_id, landlord_id, preferred_at, note, status, created_at, " +
  "tenant:profiles!viewings_tenant_id_fkey(full_name), " +
  "landlord:profiles!viewings_landlord_id_fkey(full_name)";

function asStatus(s: string): ViewingStatus {
  return s === "confirmed" || s === "declined" ? s : "pending";
}

export async function getViewings(): Promise<Viewing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("viewings")
    .select(SELECT)
    .order("preferred_at", { ascending: true });
  if (error || !data) {
    if (error) console.error("getViewings:", error.message);
    return [];
  }
  return (data as unknown as Row[]).map((v) => {
    const iAmLandlord = v.landlord_id === user.id;
    return {
      id: v.id,
      listingId: v.listing_id,
      listingTitle: v.listing_title ?? "Listing",
      otherName: (iAmLandlord ? v.tenant?.full_name : v.landlord?.full_name) ?? "RumahKu user",
      preferredAt: v.preferred_at,
      note: v.note,
      status: asStatus(v.status),
      iAmLandlord,
      createdAt: v.created_at,
    };
  });
}

/** Pending viewing requests addressed to the signed-in landlord (for a badge). */
export async function getPendingViewingCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from("viewings")
    .select("id", { count: "exact", head: true })
    .eq("landlord_id", user.id)
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}
