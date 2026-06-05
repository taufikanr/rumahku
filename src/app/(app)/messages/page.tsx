import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getConversations } from "@/lib/messages";
import { relativeFromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireProfile();
  const conversations = await getConversations();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chat with landlords and tenants directly — safely, inside RumahKu.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <MessageSquare className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-heading text-lg font-bold">No conversations yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Open a listing and tap <span className="font-medium">Message landlord</span> to start
            a safe, in-app conversation.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {c.otherName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{c.otherName}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeFromNow(c.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.listingTitle}</p>
                <p
                  className={cn(
                    "truncate text-sm",
                    c.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {c.lastMessage}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
