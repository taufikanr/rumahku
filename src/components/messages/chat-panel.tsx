"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SendHorizonal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/app/(app)/messages/actions";
import { Button } from "@/components/ui/button";

/**
 * Client island for a chat thread: live-updates via Supabase Realtime and hosts
 * the message composer. The message list itself is server-rendered above this.
 */
export function ChatPanel({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Live delivery: refresh the server-rendered thread when a new message lands.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  // Keep the latest message in view.
  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  return (
    <>
      <div ref={anchorRef} />
      <form
        ref={formRef}
        action={sendMessageAction}
        onSubmit={() => requestAnimationFrame(() => formRef.current?.reset())}
        className="sticky bottom-0 mt-3 flex items-end gap-2 border-t border-border/60 bg-background/95 py-3 backdrop-blur"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="body"
          required
          rows={1}
          placeholder="Write a message…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <SendHorizonal />
        </Button>
      </form>
    </>
  );
}
