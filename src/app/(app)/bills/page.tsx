import {
  CheckCircle2,
  Droplets,
  Home,
  Receipt,
  Trash2,
  Undo2,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getBills } from "@/lib/bills";
import { formatDate, formatRM } from "@/lib/format";
import type { Bill, BillType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AddBillForm } from "@/components/bills/add-bill-form";
import { deleteBillAction, setBillStatusAction } from "@/app/(app)/bills/actions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Bills" };

const ICONS: Record<BillType, LucideIcon> = {
  rent: Home,
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  other: Receipt,
};

export default async function BillsPage() {
  await requireProfile();
  const bills = await getBills();
  const today = new Date().toISOString().slice(0, 10);

  const rows = bills.map((b) => ({
    ...b,
    overdue: b.status !== "paid" && b.dueDate < today,
  }));
  const outstanding = rows.filter((b) => b.status !== "paid");
  const totalDue = outstanding.reduce((s, b) => s + b.amount, 0);
  const overdueCount = rows.filter((b) => b.overdue).length;

  // overdue first, then upcoming by date, then paid last
  const sorted = [...rows].sort((a, b) => {
    const rank = (x: typeof a) => (x.status === "paid" ? 2 : x.overdue ? 0 : 1);
    return rank(a) - rank(b) || a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Bill tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track rent and utilities so you never miss a payment.
          </p>
        </div>
        <AddBillForm />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Outstanding" value={formatRM(totalDue)} />
        <Stat label="Overdue" value={`${overdueCount}`} tone={overdueCount ? "danger" : undefined} />
        <Stat label="Total bills" value={`${rows.length}`} />
      </div>

      <div className="mt-6 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <Receipt className="size-10 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-lg font-bold">No bills yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your rent and utility bills to get reminders before they&apos;re due.
            </p>
          </div>
        ) : (
          sorted.map((b) => <BillRow key={b.id} bill={b} overdue={b.overdue} />)
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-heading text-lg font-bold", tone === "danger" && "text-danger")}>
        {value}
      </p>
    </div>
  );
}

function BillRow({ bill, overdue }: { bill: Bill; overdue: boolean }) {
  const Icon = ICONS[bill.type];
  const paid = bill.status === "paid";
  const statusText = paid ? "Paid" : overdue ? "Overdue" : "Due";
  const statusCls = paid ? "text-safe" : overdue ? "text-danger" : "text-warn";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
        overdue && "border-danger/30 bg-danger/5",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{bill.label}</p>
        <p className="text-xs text-muted-foreground">
          Due {formatDate(bill.dueDate)} ·{" "}
          <span className={cn("font-semibold", statusCls)}>{statusText}</span>
        </p>
      </div>
      <p className="shrink-0 font-heading font-bold">{formatRM(bill.amount)}</p>
      <div className="flex shrink-0 items-center">
        <form action={setBillStatusAction}>
          <input type="hidden" name="id" value={bill.id} />
          <input type="hidden" name="status" value={paid ? "due" : "paid"} />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label={paid ? "Mark unpaid" : "Mark paid"}
          >
            {paid ? <Undo2 /> : <CheckCircle2 className="text-safe" />}
          </Button>
        </form>
        <form action={deleteBillAction}>
          <input type="hidden" name="id" value={bill.id} />
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete bill">
            <Trash2 className="text-danger" />
          </Button>
        </form>
      </div>
    </div>
  );
}
