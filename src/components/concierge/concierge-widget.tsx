"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, SendHorizonal, X, ShieldCheck } from "lucide-react";
import { formatRM } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  title: string;
  area: string;
  price: number;
  distanceKm: number;
  scamLevel: "safe" | "caution" | "high";
}
interface Msg {
  role: "user" | "assistant";
  content: string;
  listings?: Card[];
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm your RumahKu concierge 👋 Tell me your budget, area, or what you're looking for — e.g. \"a safe room under RM500 near UMS\" — and I'll find it.",
};

const SUGGESTIONS = [
  "Safe room under RM500 near UMS",
  "Female-only room with WiFi",
  "Cheapest verified room",
];

export function ConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  async function send(text: string) {
    const query = text.trim();
    if (!query || loading) return;
    const history = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: query }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, I couldn't find anything just now.",
          listings: data.listings ?? [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I'm having trouble right now — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open RumahKu concierge"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 print:hidden"
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[calc(100dvh-8rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl print:hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-primary/5 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">RumahKu Concierge</p>
              <p className="text-[11px] text-muted-foreground">AI room finder for Sabah</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
                {m.listings && m.listings.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {m.listings.map((l) => (
                      <Link
                        key={l.id}
                        href={`/listing/${l.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-border/70 bg-background p-2.5 transition-colors hover:border-primary"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{l.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.area} · {l.distanceKm}km to UMS
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold">{formatRM(l.price)}</p>
                          {l.scamLevel === "safe" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-safe">
                              <ShieldCheck className="size-3" /> safe
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Finding rooms…
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border/60 p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about rooms, areas, prices…"
              className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <SendHorizonal className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
