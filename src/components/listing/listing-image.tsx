import { Building2, DoorOpen, Home } from "lucide-react";
import type { PropertyType } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Cohesive hue palette (blue / green / sky / emerald / amber / indigo).
const PALETTE = [230, 165, 205, 150, 38, 250];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function iconFor(type?: PropertyType) {
  if (type === "house") return Home;
  if (type === "apartment" || type === "studio") return Building2;
  return DoorOpen;
}

/**
 * A listing photo. If `seed` is a real image URL (uploaded to Supabase Storage)
 * it renders that photo; otherwise it falls back to a deterministic branded
 * gradient placeholder, so a listing always shows something (online or offline).
 */
export function ListingImage({
  seed,
  type,
  className,
  iconClassName,
  alt,
}: {
  seed: string;
  type?: PropertyType;
  className?: string;
  iconClassName?: string;
  alt?: string;
}) {
  if (seed.startsWith("http")) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={seed}
          alt={alt ?? "Listing photo"}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
    );
  }
  const hue = PALETTE[hash(seed) % PALETTE.length];
  const Icon = iconFor(type);
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 46% 56%), hsl(${(hue + 28) % 360} 52% 38%))`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      <Icon className={cn("size-10 text-white/40", iconClassName)} />
    </div>
  );
}
