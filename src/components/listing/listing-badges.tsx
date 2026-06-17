import {
  BadgeCheck,
  OctagonAlert,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PriceFairness, ScamLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCAM: Record<
  ScamLevel,
  { soft: string; solid: string; Icon: LucideIcon; label: string }
> = {
  safe: {
    soft: "bg-safe/10 text-safe",
    solid: "bg-safe text-safe-foreground",
    Icon: ShieldCheck,
    label: "Scam-safe",
  },
  caution: {
    soft: "bg-warn/15 text-warn",
    solid: "bg-warn text-warn-foreground",
    Icon: ShieldAlert,
    label: "Caution",
  },
  high: {
    soft: "bg-danger/10 text-danger",
    solid: "bg-danger text-danger-foreground",
    Icon: OctagonAlert,
    label: "High risk",
  },
};

const chip =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold [&>svg]:size-3.5";

export function ScamBadge({
  level,
  solid = false,
  className,
}: {
  level: ScamLevel;
  solid?: boolean;
  className?: string;
}) {
  const s = SCAM[level];
  return (
    <span className={cn(chip, solid ? s.solid : s.soft, className)}>
      <s.Icon />
      {s.label}
    </span>
  );
}

export function VerifiedBadge({
  solid = false,
  label = "Verified",
  className,
}: {
  solid?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        chip,
        solid ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        className,
      )}
    >
      <BadgeCheck />
      {label}
    </span>
  );
}

export function PriceBadge({
  fairness,
  className,
}: {
  fairness: PriceFairness;
  className?: string;
}) {
  const abs = Math.abs(fairness.deltaPct);
  if (fairness.verdict === "below") {
    return (
      <span className={cn(chip, "bg-safe/10 text-safe", className)}>
        <TrendingDown />
        {abs}% below avg
      </span>
    );
  }
  if (fairness.verdict === "above") {
    return (
      <span className={cn(chip, "bg-warn/15 text-warn", className)}>
        <TrendingUp />
        {abs}% above avg
      </span>
    );
  }
  return (
    <span className={cn(chip, "bg-muted text-muted-foreground", className)}>
      <Scale />
      Fair price
    </span>
  );
}

export function MatchBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <span className={cn(chip, "bg-primary/10 text-primary", className)}>
      <Users />
      {score}% match
    </span>
  );
}

/**
 * Verified Real — the property is proven to physically exist (on-site capture),
 * distinct from VerifiedBadge which only covers the landlord's identity.
 */
export function VerifiedRealBadge({
  solid = false,
  label = "Verified Real",
  className,
}: {
  solid?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        chip,
        solid ? "bg-brand-teal text-white" : "bg-brand-teal/10 text-brand-teal",
        className,
      )}
    >
      <ShieldCheck />
      {label}
    </span>
  );
}
