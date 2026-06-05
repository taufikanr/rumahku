import { Building2, GraduationCap, MapPinned, Wallet } from "lucide-react";
import { getNeighbourhoodInsight } from "@/lib/neighbourhood";
import { formatRM } from "@/lib/format";
import type { AreaId } from "@/lib/constants";

export function NeighbourhoodInsights({ areaId }: { areaId: AreaId }) {
  const n = getNeighbourhoodInsight(areaId);
  return (
    <section>
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        <MapPinned className="size-5 text-primary" /> The neighbourhood — {n.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.blurb}</p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Metric
          icon={GraduationCap}
          value={`~${n.toUms.mins} min`}
          label={`to UMS · ${n.toUms.km} km`}
        />
        <Metric
          icon={Building2}
          value={`~${n.toCity.mins} min`}
          label={`to KK city · ${n.toCity.km} km`}
        />
        <Metric icon={Wallet} value={formatRM(n.avgRoomRent)} label="avg room here" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {n.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Building2;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <Icon className="mx-auto size-4 text-primary" />
      <p className="mt-1 font-heading text-base font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
