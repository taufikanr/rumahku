import {
  Check,
  OctagonAlert,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ScamRisk } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLE: Record<
  ScamRisk["level"],
  { Icon: LucideIcon; text: string; bg: string; bar: string; label: string }
> = {
  safe: { Icon: ShieldCheck, text: "text-safe", bg: "bg-safe/10", bar: "bg-safe", label: "Looks safe" },
  caution: { Icon: ShieldAlert, text: "text-warn", bg: "bg-warn/10", bar: "bg-warn", label: "Be careful" },
  high: { Icon: OctagonAlert, text: "text-danger", bg: "bg-danger/10", bar: "bg-danger", label: "High scam risk" },
};

export function ScamPanel({
  scam,
  analyzing = false,
}: {
  scam: ScamRisk;
  analyzing?: boolean;
}) {
  const s = STYLE[scam.level];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        RumahKu Safety Check
        <span
          className={cn(
            "rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary",
            analyzing && "animate-pulse",
          )}
        >
          {analyzing ? "AI analyzing…" : scam.aiUsed ? "AI" : "AUTO"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className={cn("flex size-16 shrink-0 items-center justify-center rounded-full", s.bg, s.text)}>
          <s.Icon className="size-7" />
        </div>
        <div>
          <p className={cn("font-heading text-lg font-bold", s.text)}>{s.label}</p>
          <p className="text-sm text-muted-foreground">{scam.summary}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Scam risk score</span>
          <span className="font-medium text-foreground">{scam.score}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", s.bar)}
            style={{ width: `${Math.max(4, scam.score)}%` }}
          />
        </div>
      </div>

      {scam.reasons.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            What to watch
          </p>
          <ul className="mt-2 space-y-1.5">
            {scam.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X className="mt-0.5 size-4 shrink-0 text-danger" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scam.positives.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Good signs
          </p>
          <ul className="mt-2 space-y-1.5">
            {scam.positives.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-safe" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scam.level !== "safe" && (
        <p className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          Tip: never pay a deposit before viewing the unit in person and confirming the
          landlord&apos;s identity.
        </p>
      )}
    </div>
  );
}
