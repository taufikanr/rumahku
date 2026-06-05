"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const now = () => new Date().toISOString();

/** Landlord starts a SafeDeposit from an accepted application. */
export async function createDepositAction(formData: FormData) {
  const profile = await requireProfile("landlord");
  const applicationId = String(formData.get("applicationId") ?? "");
  if (!applicationId) redirect("/dashboard");

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("tenant_id, tenant_name, listing_id")
    .eq("id", applicationId)
    .maybeSingle();
  if (!app) redirect("/dashboard");
  const a = app as { tenant_id: string; tenant_name: string; listing_id: string };

  const { data: listing } = await supabase
    .from("listings")
    .select("title, deposit")
    .eq("id", a.listing_id)
    .maybeSingle();
  const l = (listing as { title: string; deposit: number } | null) ?? null;

  const { data: created, error } = await supabase
    .from("deposits")
    .insert({
      listing_id: a.listing_id,
      listing_title: l?.title ?? "Tenancy",
      tenant_id: a.tenant_id,
      landlord_id: profile.id,
      amount: l?.deposit ?? 0,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !created) redirect("/dashboard");
  const depositId = (created as { id: string }).id;

  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: "created",
    note: `Deposit protection opened for ${a.tenant_name}.`,
  });

  revalidatePath("/deposits");
  redirect(`/deposits/${depositId}`);
}

async function loadParties(depositId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select("tenant_id, landlord_id, proposed_return")
    .eq("id", depositId)
    .maybeSingle();
  return { supabase, dep: data as { tenant_id: string; landlord_id: string; proposed_return: number | null } | null };
}

/** Either party logs move-in / move-out condition evidence (photos + note). */
export async function addEvidenceAction(formData: FormData) {
  const profile = await requireProfile();
  const depositId = String(formData.get("depositId") ?? "");
  const phase = String(formData.get("phase") ?? "movein");
  const note = String(formData.get("note") ?? "").trim();
  const photos = formData.getAll("photos").map(String).filter((u) => u.startsWith("http"));
  if (!depositId || (!note && photos.length === 0)) return;

  const { supabase, dep } = await loadParties(depositId);
  if (!dep || (dep.tenant_id !== profile.id && dep.landlord_id !== profile.id)) return;

  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: phase === "moveout" ? "moveout_evidence" : "movein_evidence",
    note: note || null,
    photos,
  });
  await supabase.from("deposits").update({ updated_at: now() }).eq("id", depositId);
  revalidatePath(`/deposits/${depositId}`);
}

/** Landlord proposes how much of the deposit to return (with optional deductions). */
export async function proposeReturnAction(formData: FormData) {
  const profile = await requireProfile();
  const depositId = String(formData.get("depositId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim();
  if (!depositId || !(amount >= 0)) return;

  const { supabase, dep } = await loadParties(depositId);
  if (!dep || dep.landlord_id !== profile.id) return;

  await supabase
    .from("deposits")
    .update({ proposed_return: amount, status: "return_proposed", updated_at: now() })
    .eq("id", depositId);
  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: "return_proposed",
    amount,
    note: note || null,
  });
  revalidatePath(`/deposits/${depositId}`);
}

/** Tenant accepts the proposed return → released. */
export async function acceptReturnAction(formData: FormData) {
  const profile = await requireProfile();
  const depositId = String(formData.get("depositId") ?? "");
  if (!depositId) return;

  const { supabase, dep } = await loadParties(depositId);
  if (!dep || dep.tenant_id !== profile.id) return;

  await supabase.from("deposits").update({ status: "released", updated_at: now() }).eq("id", depositId);
  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: "released",
    amount: dep.proposed_return,
    note: "Tenant accepted the return. Deposit released.",
  });
  revalidatePath(`/deposits/${depositId}`);
}

/** Tenant disputes the proposed return. */
export async function disputeAction(formData: FormData) {
  const profile = await requireProfile();
  const depositId = String(formData.get("depositId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!depositId || !note) return;

  const { supabase, dep } = await loadParties(depositId);
  if (!dep || dep.tenant_id !== profile.id) return;

  await supabase.from("deposits").update({ status: "disputed", updated_at: now() }).eq("id", depositId);
  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: "disputed",
    note,
  });
  revalidatePath(`/deposits/${depositId}`);
}

/** Either party adds a note to the record. */
export async function addNoteAction(formData: FormData) {
  const profile = await requireProfile();
  const depositId = String(formData.get("depositId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!depositId || !note) return;

  const { supabase, dep } = await loadParties(depositId);
  if (!dep || (dep.tenant_id !== profile.id && dep.landlord_id !== profile.id)) return;

  await supabase.from("deposit_events").insert({
    deposit_id: depositId,
    author_id: profile.id,
    author_name: profile.fullName,
    type: "note",
    note,
  });
  await supabase.from("deposits").update({ updated_at: now() }).eq("id", depositId);
  revalidatePath(`/deposits/${depositId}`);
}
