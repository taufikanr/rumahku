import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getDeposits, STATUS_LABEL, type DepositStatus } from "@/lib/deposits";
import { formatRM, relativeFromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "SafeDeposit" };

const STATUS_STYLE: Record<DepositStatus, string> = {
  active: "bg-primary/10 text-primary",
  return_proposed: "bg-warn/15 text-warn",
  released: "bg-safe/10 text-safe",
  disputed: "bg-danger/10 text-danger",
};

export default async function DepositsPage() {
  await requireProfile();
  const deposits = await getDeposits();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="size-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">SafeDeposit</span>
      </div>
      <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Deposit protection
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Neutral deposit records with photo evidence and fair dispute resolution — so deposits
        come back fairly. <span className="text-foreground/80">No more deposit ghosting.</span>
      </p>

      {deposits.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <ShieldCheck className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-heading text-lg font-bold">No protected deposits yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When a landlord accepts your application, they can open a SafeDeposit — a transparent,
            evidence-backed record of your deposit.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
          {deposits.map((d) => (
            <Link
              key={d.id}
              href={`/deposits/${d.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{d.listingTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d.iAmLandlord ? "Tenant" : "Landlord"}: {d.otherName} · {relativeFromNow(d.updatedAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums">{formatRM(d.amount)}</p>
                <span
                  className={cn(
                    "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    STATUS_STYLE[d.status],
                  )}
                >
                  {STATUS_LABEL[d.status].split(" — ")[0]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
