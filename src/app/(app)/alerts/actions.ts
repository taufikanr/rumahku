"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { describeQuery } from "@/lib/searches";
import type { ListingFilters } from "@/lib/data";

export async function saveSearchAction(formData: FormData) {
  const profile = await requireProfile();
  let query: ListingFilters = {};
  try {
    query = JSON.parse(String(formData.get("query") ?? "{}")) as ListingFilters;
  } catch {
    query = {};
  }
  const label = String(formData.get("label") ?? "").trim() || describeQuery(query);

  const supabase = await createClient();
  await supabase.from("saved_searches").insert({
    user_id: profile.id,
    label,
    query,
    notify: true,
  });
  revalidatePath("/alerts");
  redirect("/alerts");
}

export async function deleteSearchAction(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("saved_searches").delete().eq("id", id);
  revalidatePath("/alerts");
}

export async function toggleNotifyAction(formData: FormData) {
  await requireProfile();
  const id = String(formData.get("id") ?? "");
  const notify = String(formData.get("notify") ?? "") === "1";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("saved_searches").update({ notify }).eq("id", id);
  revalidatePath("/alerts");
}
