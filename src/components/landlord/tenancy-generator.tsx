"use client";

import { useActionState, useEffect, useState } from "react";
import { Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { saveTenancyAction } from "@/app/(app)/dashboard/tenancy/actions";
import { formatDate, formatRM } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const blank = "____________";
const val = (s: string, ph = blank) => (s.trim() ? s.trim() : ph);

export function TenancyGenerator({ landlordName }: { landlordName: string }) {
  const [f, setF] = useState({
    landlord: landlordName,
    landlordId: "",
    tenant: "",
    tenantId: "",
    address: "",
    rent: "",
    deposit: "",
    term: "12",
    start: "",
    conditions: "",
  });
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((s) => ({ ...s, [k]: e.target.value }));

  const [state, action, pending] = useActionState(saveTenancyAction, undefined);
  useEffect(() => {
    if (state?.ok) toast.success("Agreement saved to your account");
    if (state?.error) toast.error(state.error);
  }, [state]);

  const rent = Number(f.rent) || 0;
  const deposit = Number(f.deposit) || rent * 2;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] print:block">
      {/* Form */}
      <div className="space-y-4 print:hidden">
        <div className="grid grid-cols-2 gap-3">
          <FieldI label="Landlord" v={f.landlord} on={set("landlord")} />
          <FieldI label="Landlord IC / Co." v={f.landlordId} on={set("landlordId")} />
          <FieldI label="Tenant" v={f.tenant} on={set("tenant")} />
          <FieldI label="Tenant IC" v={f.tenantId} on={set("tenantId")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Property address</Label>
          <Textarea id="address" rows={2} value={f.address} onChange={set("address")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldI label="Monthly rent (RM)" type="number" v={f.rent} on={set("rent")} />
          <FieldI label="Deposit (RM)" type="number" v={f.deposit} on={set("deposit")} placeholder="auto 2x" />
          <FieldI label="Term (months)" type="number" v={f.term} on={set("term")} />
          <FieldI label="Start date" type="date" v={f.start} on={set("start")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="conditions">Special conditions</Label>
          <Textarea
            id="conditions"
            rows={3}
            value={f.conditions}
            onChange={set("conditions")}
            placeholder="e.g. No pets. Rent due on the 1st of each month."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" size="lg" onClick={() => window.print()}>
            <Printer /> Print / Save as PDF
          </Button>
          <form action={action}>
            {Object.entries(f).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={String(v)} />
            ))}
            <Button type="submit" variant="outline" size="lg" className="w-full" disabled={pending}>
              <Save /> {pending ? "Saving…" : "Save to my account"}
            </Button>
          </form>
        </div>
      </div>

      {/* Live document */}
      <article className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white p-8 text-sm leading-relaxed text-neutral-900 shadow-sm print:border-0 print:shadow-none sm:p-10">
        <h2 className="text-center font-heading text-xl font-bold tracking-tight">
          TENANCY AGREEMENT
        </h2>
        <p className="mt-4">
          This Tenancy Agreement is made on <strong>{val(f.start)}</strong> between:
        </p>
        <p className="mt-3">
          <strong>LANDLORD:</strong> {val(f.landlord)}
          {f.landlordId.trim() && ` (IC / Co. No.: ${f.landlordId.trim()})`}
        </p>
        <p className="mt-1">
          <strong>TENANT:</strong> {val(f.tenant)}
          {f.tenantId.trim() && ` (IC: ${f.tenantId.trim()})`}
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-5">
          <li>
            <strong>Property.</strong> The Landlord agrees to let the property at{" "}
            <strong>{val(f.address)}</strong> (&quot;the Premises&quot;) to the Tenant.
          </li>
          <li>
            <strong>Term.</strong> A fixed term of <strong>{val(f.term)}</strong> month(s)
            commencing on <strong>{val(f.start)}</strong>.
          </li>
          <li>
            <strong>Rent.</strong> The Tenant shall pay{" "}
            <strong>{rent ? formatRM(rent) : "RM " + blank}</strong> per month, in advance,
            on or before the 1st day of each month.
          </li>
          <li>
            <strong>Deposit.</strong> A security deposit of{" "}
            <strong>{rent ? formatRM(deposit) : "RM " + blank}</strong>, refundable at the end
            of the tenancy subject to the condition of the Premises.
          </li>
          <li>
            <strong>Utilities.</strong> The Tenant shall pay for electricity, water and
            internet consumed during the tenancy unless otherwise agreed.
          </li>
          <li>
            <strong>Condition.</strong> The Tenant shall keep the Premises in good condition
            and return it in the same state, fair wear and tear excepted.
          </li>
          <li>
            <strong>Special conditions.</strong> {val(f.conditions, "None.")}
          </li>
        </ol>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div>
            <div className="border-t border-neutral-400 pt-1 text-xs">
              Landlord: {val(f.landlord)}
            </div>
            <p className="mt-2 text-xs text-neutral-500">Date: {blank}</p>
          </div>
          <div>
            <div className="border-t border-neutral-400 pt-1 text-xs">
              Tenant: {val(f.tenant)}
            </div>
            <p className="mt-2 text-xs text-neutral-500">Date: {blank}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-neutral-400">
          Generated with RumahKu · {formatDate(new Date().toISOString())} · This is a
          template and not legal advice.
        </p>
      </article>
    </div>
  );
}

function FieldI({
  label,
  v,
  on,
  type = "text",
  placeholder,
}: {
  label: string;
  v: string;
  on: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={v} onChange={on} placeholder={placeholder} />
    </div>
  );
}
