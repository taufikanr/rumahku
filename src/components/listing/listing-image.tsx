import { Building2, DoorOpen, Home } from "lucide-react";
import type { PropertyType } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Cohesive hue palette (teal / green / blue / emerald / amber / indigo).
const PALETTE = [188, 165, 205, 150, 38, 250];

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
 * Branded gradient placeholder for a listing photo. Deterministic by `seed`,
 * so a listing's gallery shows varied-but-stable tiles with zero external
 * image dependencies (always loads, online or offline).
 */
export function ListingImage({
  seed,
  type,
  className,
  iconClassName,
}: {
  seed: string;
  type?: PropertyType;
  className?: string;
  iconClassName?: string;
}) {
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
