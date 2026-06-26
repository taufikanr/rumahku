"use client";

import { useState } from "react";
import {
  Check,
  Clipboard,
  Loader2,
  OctagonAlert,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShieldResult } from "@/lib/ai-scam-shield";

const STYLE: Record<
  ShieldResult["level"],
  { Icon: LucideIcon; text: string; bg: string; bar: string; ring: string }
> = {
  safe: { Icon: ShieldCheck, text: "text-safe", bg: "bg-safe/10", bar: "bg-safe", ring: "border-safe/30" },
  caution: { Icon: ShieldAlert, text: "text-warn", bg: "bg-warn/10", bar: "bg-warn", ring: "border-warn/40" },
  high: { Icon: OctagonAlert, text: "text-danger", bg: "bg-danger/10", bar: "bg-danger", ring: "border-danger/40" },
};

const EXAMPLES: { label: string; text: string; price?: number; area?: string }[] = [
  {
    label: "Try a suspicious one",
    text: "Hi! This luxury fully-furnished condo near UMS is going for only RM230/month. I'm currently working overseas so I cannot do viewing. Please transfer the deposit dulu to lock the unit — many people are interested, today only. Bank in now and I'll courier the keys to you.",
    price: 230,
    area: "Sepanggar",
  },
  {
    label: "Try a genuine one",
    text: "Single room available in Sepanggar, about 6 minutes to UMS. RM450/month including WiFi and air-cond. Female housemates only, very tidy. Viewing welcome on weekends — message me to arrange a time. Proper tenancy agreement provided.",
    price: 450,
    area: "Sepanggar",
  },
];

export function ScamShieldTool() {
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShieldResult | null>(null);

  async function scan() {
    setError(null);
    setResult(null);
    if (text.trim().length < 10) {
      setError("Paste a listing or message (at least a sentence) to scan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scam-shield", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          price: price ? Number(price) : undefined,
          area: area || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't analyse that — try again.");
      setResult(data as ShieldResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  async function pasteFromClipboard() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch {
      /* clipboard blocked — user can paste manually */
    }
  }

  function applyExample(ex: (typeof EXAMPLES)[number]) {
    setText(ex.text);
    setPrice(ex.price ? String(ex.price) : "");
    setArea(ex.area ?? "");
    setResult(null);
    setError(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Input */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="shield-text" className="text-sm font-semibold">
            Paste the listing or message
          </label>
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Clipboard className="size-3.5" /> Paste
          </button>
        </div>
        <textarea
          id="shield-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="e.g. a room post from a Facebook group, a WhatsApp message from a 'landlord', or a Mudah listing…"
          className="w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shield-price" className="text-xs text-muted-foreground">
              Rent (RM/month) · optional
            </label>
            <input
              id="shield-price"
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="shield-area" className="text-xs text-muted-foreground">
              Area · optional
            </label>
            <input
              id="shield-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Sepanggar"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
        </div>

        <Button onClick={scan} size="lg" className="mt-4 h-11 w-full text-base" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          {loading ? "Scanning…" : "Scan for scams"}
        </Button>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => applyExample(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {ex.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>

      {/* Result */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {result ? (
          <Result result={result} />
        ) : (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-7" />
            </div>
            <p className="mt-4 font-heading text-lg font-bold">Your verdict appears here</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Paste anything you found and RumahKu&apos;s AI will flag the scam signals in seconds —
              no account needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Result({ result }: { result: ShieldResult }) {
  const s = STYLE[result.level];
  return (
    <div className={cn("rounded-2xl border bg-card p-5", s.ring)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Scam Shield verdict
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {result.aiUsed ? "AI" : "AUTO"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className={cn("flex size-16 shrink-0 items-center justify-center rounded-full", s.bg, s.text)}>
          <s.Icon className="size-8" />
        </div>
        <div>
          <p className={cn("font-heading text-xl font-extrabold", s.text)}>{result.verdict}</p>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {result.aiUsed ? "AI language analysis" : "Rule-based analysis"}
            {result.priceCheck ? " + market-price check" : ""}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Scam risk</span>
          <span className="font-medium text-foreground">{result.score}/100</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.max(4, result.score)}%` }} />
        </div>
      </div>

      {result.priceCheck && (
        <div className="mt-4 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Market price check</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                result.priceCheck.band === "fair"
                  ? "bg-safe/15 text-safe"
                  : result.priceCheck.band === "slightly-low" || result.priceCheck.band === "high"
                    ? "bg-warn/15 text-warn"
                    : "bg-danger/15 text-danger",
              )}
            >
              {result.priceCheck.deltaPct > 0 ? `+${result.priceCheck.deltaPct}%` : `${result.priceCheck.deltaPct}%`} vs avg
            </span>
          </div>
          <p className="mt-1.5 text-sm">
            <span className="font-semibold">RM{result.priceCheck.price}</span>
            <span className="text-muted-foreground">
              {" "}
              vs RM{result.priceCheck.areaAvg} average in {result.priceCheck.areaName}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{result.priceCheck.note}</p>
        </div>
      )}

      {result.redFlags.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Red flags</p>
          <ul className="mt-2 space-y-2">
            {result.redFlags.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-danger" />
                <span>
                  <span className="font-medium">{r.flag}</span>
                  {r.why && <span className="block text-xs text-muted-foreground">{r.why}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.goodSigns.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Good signs</p>
          <ul className="mt-2 space-y-1.5">
            {result.goodSigns.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-safe" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.nextSteps.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">What to do next</p>
          <ol className="mt-2 space-y-1.5">
            {result.nextSteps.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
