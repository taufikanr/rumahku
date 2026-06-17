"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface VerifyInput {
  listingId: string;
  code: string;
  lat: number;
  lng: number;
  distanceM: number;
  device: string;
  authenticity: number;
}

/**
 * Persist a completed on-site capture as a Verified Real record.
 * Best-effort: if the `listing_verifications` table hasn't been migrated yet
 * (0006), the live capture still succeeds for the demo — it just isn't stored.
 */
export async function verifyListingAction(
  input: VerifyInput,
): Promise<{ ok: boolean; stored: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("listing_verifications").upsert(
      {
        listing_id: input.listingId,
        status: "verified",
        authenticity: input.authenticity,
        code: input.code,
        lat: input.lat,
        lng: input.lng,
        distance_m: input.distanceM,
        device: input.device,
        photos_original: true,
        created_by: user?.id ?? null,
      },
      { onConflict: "listing_id" },
    );
    if (error) return { ok: true, stored: false };

    revalidatePath(`/listing/${input.listingId}`);
    revalidatePath(`/listing/${input.listingId}/verified`);
    revalidatePath("/dashboard");
    return { ok: true, stored: true };
  } catch {
    return { ok: true, stored: false };
  }
}
