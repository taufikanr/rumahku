"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies a shareable link to the renter's public passport. */
export function SharePassportButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/p/${handle}`
        : `/p/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My RumahKu Trust Passport", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed share sheet — no-op */
    }
  }

  return (
    <Button onClick={share} variant="outline" size="lg">
      {copied ? <Check className="text-safe" /> : <Share2 />}
      {copied ? "Link copied" : "Share passport"}
    </Button>
  );
}
