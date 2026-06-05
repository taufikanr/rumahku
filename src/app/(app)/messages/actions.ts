"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getOrCreateConversation, sendMessage } from "@/lib/messages";

/** Tenant taps "Message landlord" on a listing → open (or create) the thread. */
export async function startConversationAction(formData: FormData) {
  await requireProfile("tenant");
  const listingId = String(formData.get("listingId") ?? "");
  const landlordId = String(formData.get("landlordId") ?? "");
  const listingTitle = String(formData.get("listingTitle") ?? "Listing");
  if (!listingId || !landlordId) redirect("/browse");

  const id = await getOrCreateConversation(listingId, landlordId, listingTitle);
  if (!id) redirect(`/listing/${listingId}`);
  redirect(`/messages/${id}`);
}

export async function sendMessageAction(formData: FormData) {
  await requireProfile();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "");
  if (!conversationId || !body.trim()) return;
  await sendMessage(conversationId, body);
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
