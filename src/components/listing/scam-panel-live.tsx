"use client";

import { useEffect, useState } from "react";
import type { ScamRisk } from "@/lib/types";
import { ScamPanel } from "@/components/listing/scam-panel";

/**
 * Renders the rule-based scam panel immediately, then progressively upgrades it
 * with the Gemini AI assessment fetched from /api/scam-check. The page never blocks.
 */
export function ScamPanelLive({
  listingId,
  initial,
}: {
  listingId: string;
  initial: ScamRisk;
}) {
  const [scam, setScam] = useState<ScamRisk>(initial);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/scam-check?id=${encodeURIComponent(listingId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && d && typeof d.score === "number") setScam(d as ScamRisk);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAnalyzing(false);
      });
    return () => {
      active = false;
    };
  }, [listingId]);

  return <ScamPanel scam={scam} analyzing={analyzing && !scam.aiUsed} />;
}
