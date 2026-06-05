"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ViewingState = { ok?: boolean; error?: string } | undefined;

/** Tenant requests a viewing slot for a listing. */
export async function requestViewingAction(
  _prev: ViewingState,
  formData: FormData,
): Promise<ViewingState> {
  const profile = await requireProfile("tenant");
  const listingId = String(formData.get("listingId") ?? "");
  const landlordId = String(formData.get("landlordId") ?? "");
  const listingTitle = String(formData.get("listingTitle") ?? "Listing");
  const when = String(formData.get("preferredAt") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!listingId || !landlordId || !when) {
    return { error: "Please pick a date and time." };
  }

  // datetime-local is wall-clock; pin it to Kota Kinabalu time (UTC+8).
  const iso = new Date(`${when}:00+08:00`).toISOString();
  if (Number.isNaN(Date.parse(iso))) return { error: "That date/time looks invalid." };

  const supabase = await createClient();
  const { error } = await supabase.from("viewings").insert({
    listing_id: listingId,
    listing_title: listingTitle,
    tenant_id: profile.id,
    landlord_id: landlordId,
    preferred_at: iso,
    note: note || null,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/viewings");
  return { ok: true };
}

/** Landlord confirms or declines a viewing request. */
export async function setViewingStatusAction(formData: FormData) {
  await requireProfile("landlord");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["confirmed", "declined"].includes(status)) return;
  const supabase = await createClient();
  // RLS limits updates to the landlord/tenant on the viewing.
  await supabase.from("viewings").update({ status }).eq("id", id);
  revalidatePath("/viewings");
}

/** Tenant cancels their own viewing request. */
export async function cancelViewingAction(formData: FormData) {
  const profile = await requireProfile("tenant");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  // RLS limits this to the tenant's own viewings.
  await supabase.from("viewings").update({ status: "cancelled" }).eq("id", id).eq("tenant_id", profile.id);
  revalidatePath("/viewings");
}
