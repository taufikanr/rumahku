import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Camera,
  Check,
  CheckCircle2,
  Home,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getDeposit, STATUS_LABEL, type DepositEventType, type DepositStatus } from "@/lib/deposits";
import { formatRM, relativeFromNow } from "@/lib/format";
import { EvidenceForm } from "@/components/deposits/evidence-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptReturnAction,
  addNoteAction,
  disputeAction,
  proposeReturnAction,
} from "@/app/(app)/deposits/actions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Deposit protection" };

const STATUS_STYLE: Record<DepositStatus, string> = {
  active: "bg-primary/10 text-primary",
  return_proposed: "bg-warn/15 text-warn",
  released: "bg-safe/10 text-safe",
  disputed: "bg-danger/10 text-danger",
};

const EVENT: Record<DepositEventType, { icon: LucideIcon; label: string; tone: string }> = {
  created: { icon: ShieldCheck, label: "Protection opened", tone: "text-primary" },
  movein_evidence: { icon: Camera, label: "Move-in evidence", tone: "text-primary" },
  moveout_evidence: { icon: Camera, label: "Move-out evidence", tone: "text-warn" },
  return_proposed: { icon: Banknote, label: "Return proposed", tone: "text-warn" },
  accepted: { icon: Check, label: "Accepted", tone: "text-safe" },
  released: { icon: CheckCircle2, label: "Deposit released", tone: "text-safe" },
  disputed: { icon: AlertTriangle, label: "Dispute raised", tone: "text-danger" },
  note: { icon: MessageSquare, label: "Note", tone: "text-muted-foreground" },
};

export default async function DepositPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const d = await getDeposit(id);
  if (!d) redirect("/deposits");

  const deductions =
    d.proposedReturn != null ? Math.max(0, d.amount - d.proposedReturn) : null;
  const canEvidence = d.status !== "released";
  const canPropose = d.iAmLandlord && (d.status === "active" || d.status === "disputed");
  const canRespond = d.iAmTenant && d.status === "return_proposed";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href="/deposits"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All deposits
      </Link>

      {/* Protection summary */}
      <div className="mt-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/30 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" /> SafeDeposit
            </p>
            {d.listingId ? (
              <Link
                href={`/listing/${d.listingId}`}
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <Home className="size-3.5" /> {d.listingTitle}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{d.listingTitle}</p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              STATUS_STYLE[d.status],
            )}
          >
            {STATUS_LABEL[d.status]}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Deposit protected</p>
            <p className="font-heading text-3xl font-extrabold tabular-nums">
              {formatRM(d.amount)}
            </p>
          </div>
          {d.proposedReturn != null && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {d.status === "released" ? "Returned" : "Proposed return"}
              </p>
              <p className="font-heading text-xl font-bold tabular-nums text-safe">
                {formatRM(d.proposedReturn)}
              </p>
              {deductions ? (
                <p className="text-[11px] text-danger">− {formatRM(deductions)} deductions</p>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {d.landlordName} (landlord) ⇄ {d.tenantName} (tenant)
        </p>
        <p className="mt-2 rounded-lg bg-background/60 p-2.5 text-[11px] text-muted-foreground">
          In production the cash is held by a licensed escrow partner. Here, RumahKu provides the
          neutral record, photo evidence and dispute resolution that makes the return fair.
        </p>
      </div>

      {/* Action panel */}
      {(canPropose || canRespond || canEvidence) && (
        <div className="mt-5 space-y-3">
          {canPropose && (
            <form
              action={proposeReturnAction}
              className="space-y-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Banknote className="size-4 text-primary" /> Propose deposit return
              </p>
              <input type="hidden" name="depositId" value={d.id} />
              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount to return (RM)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min={0}
                    max={d.amount}
                    defaultValue={d.amount}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pnote">Deduction reasons (if any)</Label>
                  <Textarea
                    id="pnote"
                    name="note"
                    rows={2}
                    placeholder="e.g. RM50 for cleaning, RM30 for a broken cabinet hinge."
                  />
                </div>
              </div>
              <Button type="submit" size="sm">
                Send proposal to tenant
              </Button>
            </form>
          )}

          {canRespond && (
            <div className="grid gap-3 rounded-2xl border border-warn/40 bg-warn/5 p-4">
              <p className="text-sm font-semibold">
                Your landlord proposed returning {formatRM(d.proposedReturn ?? 0)} of{" "}
                {formatRM(d.amount)}.
              </p>
              <div className="flex flex-wrap gap-2">
                <form action={acceptReturnAction}>
                  <input type="hidden" name="depositId" value={d.id} />
                  <Button type="submit" size="sm">
                    <Check /> Accept return
                  </Button>
                </form>
              </div>
              <form action={disputeAction} className="space-y-2 border-t border-warn/30 pt-3">
                <input type="hidden" name="depositId" value={d.id} />
                <Label htmlFor="dnote">Not fair? Raise a dispute</Label>
                <Textarea
                  id="dnote"
                  name="note"
                  rows={2}
                  required
                  placeholder="Explain why the deductions aren't fair — attach evidence above."
                />
                <Button type="submit" variant="outline" size="sm">
                  <AlertTriangle /> Dispute proposal
                </Button>
              </form>
            </div>
          )}

          {canEvidence && <EvidenceForm depositId={d.id} userId={profile.id} />}

          {canEvidence && (
            <form
              action={addNoteAction}
              className="space-y-2 rounded-2xl border border-border/70 bg-card p-4"
            >
              <input type="hidden" name="depositId" value={d.id} />
              <Label htmlFor="note">Add a note</Label>
              <Textarea id="note" name="note" rows={2} required placeholder="Add a message to the record…" />
              <Button type="submit" variant="outline" size="sm">
                Add note
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Timeline */}
      <h2 className="mt-8 mb-3 font-heading text-lg font-bold">History</h2>
      <div className="space-y-4">
        {d.events.map((e) => {
          const meta = EVENT[e.type];
          const Icon = meta.icon;
          return (
            <div key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-muted", meta.tone)}>
                  <Icon className="size-4" />
                </span>
                <span className="mt-1 w-px flex-1 bg-border" />
              </div>
              <div className="-mt-0.5 flex-1 pb-2">
                <p className="text-sm font-semibold">
                  {meta.label}
                  {e.amount != null && (e.type === "return_proposed" || e.type === "released") && (
                    <span className="ml-1 font-bold">{formatRM(e.amount)}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.authorName} · {relativeFromNow(e.createdAt)}
                </p>
                {e.note && <p className="mt-1 text-sm text-foreground/90">{e.note}</p>}
                {e.photos.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {e.photos.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt="Condition evidence"
                        className="aspect-square w-full rounded-lg border border-border object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
