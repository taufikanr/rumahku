import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getThread } from "@/lib/messages";
import { ChatPanel } from "@/components/messages/chat-panel";
import { cn } from "@/lib/utils";

export const metadata = { title: "Conversation" };

/** Kota Kinabalu local time (UTC+8, no DST) — deterministic for SSR. */
function timeKK(iso: string): string {
  const d = new Date(Date.parse(iso) + 8 * 3600_000);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ap}`;
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireProfile();
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) redirect("/messages");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-2xl flex-col px-4 sm:px-6">
      {/* Thread header */}
      <div className="sticky top-16 z-10 -mx-4 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Link
          href="/messages"
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Back to messages"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {thread.otherName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{thread.otherName}</p>
          {thread.listingId ? (
            <Link
              href={`/listing/${thread.listingId}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <Home className="size-3" /> {thread.listingTitle}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">{thread.listingTitle}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 py-4">
        {thread.messages.length === 0 && (
          <p className="mx-auto mt-8 max-w-xs text-center text-sm text-muted-foreground">
            Say hello 👋 — ask about viewing times, the deposit, or anything else.
          </p>
        )}
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex flex-col", m.mine ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                m.mine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
            </div>
            <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
              {timeKK(m.createdAt)}
            </span>
          </div>
        ))}
      </div>

      <ChatPanel conversationId={id} />
    </div>
  );
}
