"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SELECT_CLS =
  "h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const PRICE_STEPS = [200, 300, 400, 500, 600, 800, 1000, 1500, 2000];

const SORTS: { value: string; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "distance", label: "Closest to UMS" },
  { value: "match", label: "Best housemate match" },
  { value: "newest", label: "Newest" },
];

export function ListingFilters({
  areas,
}: {
  areas: { id: string; name: string; count: number }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const get = (k: string) => sp.get(k) ?? "";
  const hasFilters = Array.from(sp.keys()).length > 0;
  const safeOn = sp.get("safe") === "1";
  const verifiedOn = sp.get("verified") === "1";

  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() || null });
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search area, e.g. 'near UMS', 'Luyang', 'studio'…"
            className="h-9 pl-9"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>

      {/* Dropdowns */}
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          aria-label="Area"
          className={SELECT_CLS}
          value={get("area")}
          onChange={(e) => update({ area: e.target.value || null })}
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.count})
            </option>
          ))}
        </select>

        <select
          aria-label="Property type"
          className={SELECT_CLS}
          value={get("type")}
          onChange={(e) => update({ type: e.target.value || null })}
        >
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Minimum price"
          className={SELECT_CLS}
          value={get("min")}
          onChange={(e) => update({ min: e.target.value || null })}
        >
          <option value="">Min price</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              RM{p}+
            </option>
          ))}
        </select>

        <select
          aria-label="Maximum price"
          className={SELECT_CLS}
          value={get("max")}
          onChange={(e) => update({ max: e.target.value || null })}
        >
          <option value="">Max price</option>
          {PRICE_STEPS.map((p) => (
            <option key={p} value={p}>
              up to RM{p}
            </option>
          ))}
        </select>

        <select
          aria-label="Gender"
          className={SELECT_CLS}
          value={get("gender")}
          onChange={(e) => update({ gender: e.target.value || null })}
        >
          <option value="">Any gender</option>
          <option value="female">Female only</option>
          <option value="male">Male only</option>
        </select>

        <select
          aria-label="Distance to UMS"
          className={SELECT_CLS}
          value={get("maxKm")}
          onChange={(e) => update({ maxKm: e.target.value || null })}
        >
          <option value="">Any distance</option>
          <option value="2">≤ 2 km to UMS</option>
          <option value="5">≤ 5 km to UMS</option>
          <option value="10">≤ 10 km to UMS</option>
        </select>

        <select
          aria-label="Sort by"
          className={cn(SELECT_CLS, "ml-auto")}
          value={get("sort") || "recommended"}
          onChange={(e) => update({ sort: e.target.value === "recommended" ? null : e.target.value })}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggles */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TogglePill
          active={safeOn}
          onClick={() => update({ safe: safeOn ? null : "1" })}
          icon={<ShieldCheck className="size-3.5" />}
          label="Scam-safe only"
        />
        <TogglePill
          active={verifiedOn}
          onClick={() => update({ verified: verifiedOn ? null : "1" })}
          icon={<BadgeCheck className="size-3.5" />}
          label="Verified only"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

function TogglePill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
