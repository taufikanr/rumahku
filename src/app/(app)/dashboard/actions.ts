"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AREA_BY_ID, type AreaId } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ListingFormState = { error?: string } | undefined;

export async function createListingAction(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const profile = await requireProfile("landlord");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const areaId = String(formData.get("area") ?? "") as AreaId;
  const propertyType = String(formData.get("type") ?? "room");
  const price = Number(formData.get("price") ?? 0);
  const deposit = Number(formData.get("deposit") ?? 0) || price * 2;
  const bedrooms = Number(formData.get("bedrooms") ?? 1);
  const bathrooms = Number(formData.get("bathrooms") ?? 1);
  const sizeSqft = Number(formData.get("size") ?? 0) || null;
  const furnished = String(formData.get("furnished") ?? "partial");
  const gender = String(formData.get("gender") ?? "any");
  const availableFrom =
    String(formData.get("availableFrom") ?? "") ||
    new Date().toISOString().slice(0, 10);
  const amenities = formData.getAll("amenities").map(String);

  if (!title || !description || !price) {
    return { error: "Please fill in the title, description and price." };
  }
  const area = AREA_BY_ID[areaId];
  if (!area) return { error: "Please choose a valid area." };

  const id = crypto.randomUUID();
  // Real uploaded photo URLs (Supabase Storage); fall back to branded placeholders.
  const uploaded = formData
    .getAll("photos")
    .map(String)
    .filter((u) => u.startsWith("http"));
  const photos = uploaded.length ? uploaded : [1, 2, 3, 4].map((n) => `${id}-${n}`);

  const supabase = await createClient();
  const { error } = await supabase.from("listings").insert({
    id,
    landlord_id: profile.id,
    title,
    description,
    area_id: areaId,
    address_line: `${area.name}, Kota Kinabalu, Sabah`,
    lat: area.lat,
    lng: area.lng,
    price,
    deposit,
    property_type: propertyType,
    bedrooms,
    bathrooms,
    size_sqft: sizeSqft,
    furnished,
    gender_preference: gender,
    photos,
    amenities,
    available_from: availableFrom,
    current_housemates: [],
    status: "active",
  });
  if (error) return { error: error.message };

  revalidatePath("/browse");
  revalidatePath("/dashboard");
  redirect("/dashboard?posted=1");
}

export async function deleteListingAction(formData: FormData) {
  const profile = await requireProfile("landlord");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("listings").delete().eq("id", id).eq("landlord_id", profile.id);
  revalidatePath("/browse");
  revalidatePath("/dashboard");
}

export async function setApplicationStatusAction(formData: FormData) {
  await requireProfile("landlord");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  if (!id) return;
  const supabase = await createClient();
  // RLS ensures a landlord can only update applications to their own listings.
  await supabase.from("applications").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
}
