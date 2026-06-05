import { createClient } from "@/lib/supabase/server";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  mine: boolean;
}

export interface ConversationSummary {
  id: string;
  listingId: string | null;
  listingTitle: string;
  otherName: string;
  otherId: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export interface ConversationThread {
  id: string;
  listingId: string | null;
  listingTitle: string;
  otherName: string;
  messages: ChatMessage[];
}

interface ConvoRow {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  tenant_id: string;
  landlord_id: string;
  last_message_at: string;
  tenant: { full_name: string } | null;
  landlord: { full_name: string } | null;
}

const CONVO_SELECT =
  "id, listing_id, listing_title, tenant_id, landlord_id, last_message_at, " +
  "tenant:profiles!conversations_tenant_id_fkey(full_name), " +
  "landlord:profiles!conversations_landlord_id_fkey(full_name)";

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** All conversations for the signed-in user (either side), newest activity first. */
export async function getConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(CONVO_SELECT)
    .order("last_message_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("getConversations:", error.message);
    return [];
  }
  const convos = data as unknown as ConvoRow[];
  if (convos.length === 0) return [];

  // Last message + unread tally per conversation (two light queries).
  const ids = convos.map((c) => c.id);
  const { data: msgs } = await supabase
    .from("messages")
    .select("conversation_id, body, sender_id, read_at, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  const last = new Map<string, string>();
  const unread = new Map<string, number>();
  for (const m of (msgs as MsgTally[] | null) ?? []) {
    if (!last.has(m.conversation_id)) last.set(m.conversation_id, m.body);
    if (!m.read_at && m.sender_id !== user.id) {
      unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
    }
  }

  return convos.map((c) => {
    const iAmTenant = c.tenant_id === user.id;
    return {
      id: c.id,
      listingId: c.listing_id,
      listingTitle: c.listing_title ?? "Listing",
      otherName: (iAmTenant ? c.landlord?.full_name : c.tenant?.full_name) ?? "RumahKu user",
      otherId: iAmTenant ? c.landlord_id : c.tenant_id,
      lastMessage: last.get(c.id) ?? "Start the conversation",
      lastMessageAt: c.last_message_at,
      unread: unread.get(c.id) ?? 0,
    };
  });
}

interface MsgTally {
  conversation_id: string;
  body: string;
  sender_id: string;
  read_at: string | null;
  created_at: string;
}

interface MsgRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

/** A single thread with its messages. Marks the other party's messages as read. */
export async function getThread(id: string): Promise<ConversationThread | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: convo } = await supabase
    .from("conversations")
    .select(CONVO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!convo) return null;
  const c = convo as unknown as ConvoRow;

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  // Mark incoming unread messages as read.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .is("read_at", null)
    .neq("sender_id", user.id);

  const iAmTenant = c.tenant_id === user.id;
  return {
    id: c.id,
    listingId: c.listing_id,
    listingTitle: c.listing_title ?? "Listing",
    otherName: (iAmTenant ? c.landlord?.full_name : c.tenant?.full_name) ?? "RumahKu user",
    messages: ((msgs as MsgRow[] | null) ?? []).map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
      readAt: m.read_at,
      mine: m.sender_id === user.id,
    })),
  };
}

/** Total unread messages for the signed-in user (for the nav badge). */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase
    .from("messages")
    .select("id, conversations!inner(tenant_id, landlord_id)", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", user.id);
  if (error) return 0;
  return count ?? 0;
}

/**
 * Find or create the (listing, tenant, landlord) conversation for the signed-in
 * tenant, returning its id. Returns null if not signed in.
 */
export async function getOrCreateConversation(
  listingId: string,
  landlordId: string,
  listingTitle: string,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === landlordId) return null;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("tenant_id", user.id)
    .eq("landlord_id", landlordId)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      listing_title: listingTitle,
      tenant_id: user.id,
      landlord_id: landlordId,
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("getOrCreateConversation:", error?.message);
    return null;
  }
  return (created as { id: string }).id;
}

/** Insert a message into a conversation the user belongs to. */
export async function sendMessage(conversationId: string, body: string): Promise<boolean> {
  const trimmed = body.trim();
  if (!trimmed) return false;
  const uid = await currentUserId();
  if (!uid) return false;
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: uid, body: trimmed.slice(0, 2000) });
  if (error) {
    console.error("sendMessage:", error.message);
    return false;
  }
  return true;
}
