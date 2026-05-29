"use server";

import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type TenancyState = { ok?: boolean; error?: string } | undefined;

export async function saveTenancyAction(
  _prev: TenancyState,
  formData: FormData,
): Promise<TenancyState> {
  const profile = await requireProfile("landlord");

  const data = {
    landlord: String(formData.get("landlord") ?? ""),
    landlordId: String(formData.get("landlordId") ?? ""),
    tenant: String(formData.get("tenant") ?? ""),
    tenantId: String(formData.get("tenantId") ?? ""),
    address: String(formData.get("address") ?? ""),
    rent: Number(formData.get("rent") ?? 0),
    deposit: Number(formData.get("deposit") ?? 0),
    term: Number(formData.get("term") ?? 12),
    start: String(formData.get("start") ?? ""),
    conditions: String(formData.get("conditions") ?? ""),
  };

  if (!data.tenant || !data.address || !data.rent) {
    return { error: "Add at least the tenant name, property address and rent." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tenancy_agreements").insert({
    landlord_id: profile.id,
    listing_id: null,
    data,
  });
  if (error) return { error: error.message };

  return { ok: true };
}
