import Link from "next/link";
import {
  Camera,
  Check,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import type { EnrichedListing, PropertyVerifyStatus } from "@/lib/types";
import { VERIFY_LABEL } from "@/lib/verification";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STYLE: Record<
  PropertyVerifyStatus,
  { Icon: LucideIcon; text: string; bg: string; bar: string; blurb: string }
> = {
  verified: {
    Icon: ShieldCheck,
    text: "text-brand-teal",
    bg: "bg-brand-teal/10",
    bar: "bg-brand-teal",
    blurb: "This unit was proven real by an on-site, GPS-stamped live capture.",
  },
  unverified: {
    Icon: Shield,
    text: "text-muted-foreground",
    bg: "bg-muted",
    bar: "bg-muted-foreground/40",
    blurb: "The landlord hasn't done an on-site verification for this unit yet.",
  },
  flagged: {
    Icon: ShieldAlert,
    text: "text-danger",
    bg: "bg-danger/10",
    bar: "bg-danger",
    blurb: "We found signs this listing may not be genuine. Treat it with caution.",
  },
};

/** Proof-of-Property panel — the property half of RumahKu's trust system. */
export function VerifiedRealPanel({ listing }: { listing: EnrichedListing }) {
  const v = listing.verification;
  const s = STYLE[v.status];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ShieldCheck className="size-3.5 text-brand-teal" />
        Proof of Property
        <span className="rounded bg-brand-teal/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-brand-teal">
          VERIFIED REAL
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-full",
            s.bg,
            s.text,
          )}
        >
          <s.Icon className="size-7" />
        </div>
        <div>
          <p className={cn("font-heading text-lg font-bold", s.text)}>
            {VERIFY_LABEL[v.status]}
          </p>
          <p className="text-sm text-muted-foreground">{s.blurb}</p>
        </div>
      </div>

      {/* Authenticity score */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Authenticity score</span>
          <span className="font-medium text-foreground">{v.authenticity}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", s.bar)}
            style={{ width: `${Math.max(4, v.authenticity)}%` }}
          />
        </div>
      </div>

      {/* Transparent checks */}
      <ul className="mt-4 space-y-2">
        {v.checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-sm">
            {c.pass ? (
              <Check className="mt-0.5 size-4 shrink-0 text-safe" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0">
              <span className={cn(!c.pass && "text-muted-foreground")}>{c.label}</span>
              <span className="block text-xs text-muted-foreground">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* On-site capture proof */}
      {v.capture && (
        <div className="mt-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-3 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-brand-teal">
            <Camera className="size-3.5" /> On-site capture
          </p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
            <dt>Captured</dt>
            <dd className="text-right text-foreground">{formatDate(v.capture.capturedAt)}</dd>
            <dt>GPS pin</dt>
            <dd className="text-right text-foreground tabular-nums">
              {v.capture.lat.toFixed(4)}, {v.capture.lng.toFixed(4)}
            </dd>
            <dt>Accuracy</dt>
            <dd className="text-right text-foreground">{v.capture.distanceM} m from listing</dd>
            <dt>One-time code</dt>
            <dd className="text-right font-mono text-foreground">{v.capture.code} ✓</dd>
          </dl>
        </div>
      )}

      {/* Flagged warning */}
      {v.status === "flagged" && v.flagReason && (
        <p className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
          {v.flagReason} Never pay a deposit or booking fee for this unit before seeing it in
          person.
        </p>
      )}

      {/* CTA */}
      <div className="mt-4">
        {v.status === "verified" ? (
          <Link
            href={`/listing/${listing.id}/verified`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal hover:underline"
          >
            <ShieldCheck className="size-4" /> View authenticity certificate →
          </Link>
        ) : v.status === "unverified" ? (
          <Link
            href={`/dashboard/verify/${listing.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <MapPin className="size-4" /> Are you the landlord? Verify this property →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
