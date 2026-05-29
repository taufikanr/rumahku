"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type BillFormState = { error?: string; ok?: boolean } | undefined;

export async function createBillAction(
  _prev: BillFormState,
  formData: FormData,
): Promise<BillFormState> {
  const profile = await requireProfile();
  const label = String(formData.get("label") ?? "").trim();
  const type = String(formData.get("type") ?? "other");
  const amount = Number(formData.get("amount") ?? 0);
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!label || !amount || !dueDate) {
    return { error: "Please fill in the label, amount and due date." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bills").insert({
    tenant_id: profile.id,
    label,
    type,
    amount,
    due_date: dueDate,
    status: "due",
  });
  if (error) return { error: error.message };

  revalidatePath("/bills");
  return { ok: true };
}

export async function setBillStatusAction(formData: FormData) {
  const profile = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "due");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("bills")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", profile.id);
  revalidatePath("/bills");
}

export async function deleteBillAction(formData: FormData) {
  const profile = await requireProfile();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("bills").delete().eq("id", id).eq("tenant_id", profile.id);
  revalidatePath("/bills");
}
