import { createClient } from "@/lib/supabase/server";

export type DepositStatus = "active" | "return_proposed" | "released" | "disputed";

export type DepositEventType =
  | "created"
  | "movein_evidence"
  | "moveout_evidence"
  | "return_proposed"
  | "accepted"
  | "disputed"
  | "note"
  | "released";

export interface DepositSummary {
  id: string;
  listingTitle: string;
  amount: number;
  status: DepositStatus;
  otherName: string;
  iAmLandlord: boolean;
  updatedAt: string;
}

export interface DepositEvent {
  id: string;
  type: DepositEventType;
  authorName: string;
  note: string | null;
  photos: string[];
  amount: number | null;
  createdAt: string;
  mine: boolean;
}

export interface DepositDetail {
  id: string;
  listingId: string | null;
  listingTitle: string;
  amount: number;
  proposedReturn: number | null;
  status: DepositStatus;
  tenantName: string;
  landlordName: string;
  iAmLandlord: boolean;
  iAmTenant: boolean;
  events: DepositEvent[];
}

export const STATUS_LABEL: Record<DepositStatus, string> = {
  active: "Active — deposit protected",
  return_proposed: "Return proposed",
  released: "Released",
  disputed: "In dispute",
};

interface DepositRow {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  proposed_return: number | null;
  status: string;
  updated_at: string;
  tenant: { full_name: string } | null;
  landlord: { full_name: string } | null;
}

const SELECT =
  "id, listing_id, listing_title, tenant_id, landlord_id, amount, proposed_return, status, updated_at, " +
  "tenant:profiles!deposits_tenant_id_fkey(full_name), " +
  "landlord:profiles!deposits_landlord_id_fkey(full_name)";

function asStatus(s: string): DepositStatus {
  return (["active", "return_proposed", "released", "disputed"] as const).includes(
    s as DepositStatus,
  )
    ? (s as DepositStatus)
    : "active";
}

/** All deposit protections for the signed-in user (either side). */
export async function getDeposits(): Promise<DepositSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("deposits")
    .select(SELECT)
    .order("updated_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("getDeposits:", error.message);
    return [];
  }
  return (data as unknown as DepositRow[]).map((d) => {
    const iAmLandlord = d.landlord_id === user.id;
    return {
      id: d.id,
      listingTitle: d.listing_title ?? "Tenancy",
      amount: d.amount,
      status: asStatus(d.status),
      otherName: (iAmLandlord ? d.tenant?.full_name : d.landlord?.full_name) ?? "RumahKu user",
      iAmLandlord,
      updatedAt: d.updated_at,
    };
  });
}

interface EventRow {
  id: string;
  type: string;
  author_id: string;
  author_name: string;
  note: string | null;
  photos: string[] | null;
  amount: number | null;
  created_at: string;
}

export async function getDeposit(id: string): Promise<DepositDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: dep } = await supabase.from("deposits").select(SELECT).eq("id", id).maybeSingle();
  if (!dep) return null;
  const d = dep as unknown as DepositRow;

  const { data: events } = await supabase
    .from("deposit_events")
    .select("id, type, author_id, author_name, note, photos, amount, created_at")
    .eq("deposit_id", id)
    .order("created_at", { ascending: true });

  return {
    id: d.id,
    listingId: d.listing_id,
    listingTitle: d.listing_title ?? "Tenancy",
    amount: d.amount,
    proposedReturn: d.proposed_return,
    status: asStatus(d.status),
    tenantName: d.tenant?.full_name ?? "Tenant",
    landlordName: d.landlord?.full_name ?? "Landlord",
    iAmLandlord: d.landlord_id === user.id,
    iAmTenant: d.tenant_id === user.id,
    events: ((events as EventRow[] | null) ?? []).map((e) => ({
      id: e.id,
      type: e.type as DepositEventType,
      authorName: e.author_name,
      note: e.note,
      photos: e.photos ?? [],
      amount: e.amount,
      createdAt: e.created_at,
      mine: e.author_id === user.id,
    })),
  };
}
