"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ApplyState = { ok?: boolean; error?: string } | undefined;

export async function applyAction(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return {
      error: "Please log in to apply — you can still contact the landlord on WhatsApp.",
    };
  }
  const listingId = String(formData.get("listingId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!listingId || !message) return { error: "Please write a short message." };

  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert({
    listing_id: listingId,
    tenant_id: profile.id,
    tenant_name: profile.fullName,
    message,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export type ReviewState = { ok?: boolean; error?: string } | undefined;

export async function addReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Please log in to write a review." };

  const listingId = String(formData.get("listingId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();
  if (!listingId || !comment) return { error: "Please add a short comment." };
  if (!(rating >= 1 && rating <= 5)) return { error: "Please pick a star rating." };

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    listing_id: listingId,
    author_name: profile.fullName,
    rating,
    comment: comment.slice(0, 1000),
  });
  if (error) return { error: error.message };

  revalidatePath(`/listing/${listingId}`);
  return { ok: true };
}
