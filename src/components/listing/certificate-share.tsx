"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies / shares the current "Verified by RumahKu" certificate URL. */
export function CertificateShare({ certificateId }: { certificateId: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `RumahKu — Verified Real (${certificateId})`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet — no-op */
    }
  }

  return (
    <Button onClick={share} variant="outline" size="lg">
      {copied ? <Check className="text-safe" /> : <Share2 />}
      {copied ? "Link copied" : "Share certificate"}
    </Button>
  );
}
