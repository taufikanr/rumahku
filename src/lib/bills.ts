import { createClient } from "@/lib/supabase/server";
import type { Bill, BillType } from "@/lib/types";

interface BillRow {
  id: string;
  listing_id: string | null;
  label: string;
  type: string;
  amount: number;
  due_date: string;
  status: string;
}

/** Bills for the signed-in user, soonest due first. */
export async function getBills(): Promise<Bill[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("bills")
    .select("*")
    .eq("tenant_id", user.id)
    .order("due_date", { ascending: true });
  return ((data as BillRow[] | null) ?? []).map((r) => ({
    id: r.id,
    listingId: r.listing_id ?? undefined,
    label: r.label,
    type: r.type as BillType,
    amount: r.amount,
    dueDate: r.due_date,
    status: r.status === "paid" ? "paid" : "due",
  }));
}
