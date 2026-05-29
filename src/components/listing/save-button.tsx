"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export function SaveButton({
  id,
  className,
  variant = "overlay",
}: {
  id: string;
  className?: string;
  variant?: "overlay" | "plain";
}) {
  const { saved, toggle } = useSaved(id);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save listing"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
        toast.success(saved ? "Removed from saved" : "Saved to your list");
      }}
      className={cn(
        "pointer-events-auto inline-flex size-8 items-center justify-center rounded-full transition",
        variant === "overlay"
          ? "bg-background/85 text-foreground shadow-sm backdrop-blur hover:bg-background"
          : "border border-border bg-background hover:bg-muted",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-danger text-danger")} />
    </button>
  );
}
