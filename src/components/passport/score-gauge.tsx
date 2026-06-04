import { BAND_LABEL, scoreFraction, type RentScore } from "@/lib/passport";
import { cn } from "@/lib/utils";

const BAND_COLOR: Record<RentScore["band"], string> = {
  building: "text-muted-foreground",
  fair: "text-warn",
  good: "text-primary",
  "very-good": "text-safe",
  excellent: "text-premium",
};

const R = 70;
const STROKE = 14;
// Circumference of the track circle (constant; rounded for SSR/CSR stability).
const C = Number((2 * Math.PI * R).toFixed(2));

/** Circular gauge for the RumahKu Rent Score (300–850). Server-rendered SVG. */
export function ScoreGauge({ score, className }: { score: RentScore; className?: string }) {
  const frac = scoreFraction(score.value);
  const dash = Number((frac * C).toFixed(2));
  const color = BAND_COLOR[score.band];

  return (
    <div className={cn("relative inline-grid place-items-center", className)}>
      <svg viewBox="0 0 180 180" className="size-44 -rotate-90" aria-hidden>
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          strokeWidth={STROKE}
          className="text-muted"
          stroke="currentColor"
          strokeOpacity={0.4}
        />
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className={color}
          stroke="currentColor"
          strokeDasharray={`${dash} ${C}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-heading text-4xl font-extrabold tabular-nums", color)}>
          {score.value}
        </span>
        <span className="text-xs font-medium text-muted-foreground">RumahKu Rent Score</span>
        <span className={cn("mt-1 text-sm font-bold", color)}>{BAND_LABEL[score.band]}</span>
      </div>
    </div>
  );
}
