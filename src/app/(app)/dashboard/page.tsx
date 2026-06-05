import Link from "next/link";
import { BadgeCheck, CalendarClock, Check, CheckCircle2, Home, Inbox, Plus, ShieldCheck, Star, X } from "lucide-react";
import { AREA_BY_ID, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { getLandlordApplications, type LandlordApplication } from "@/lib/applications";
import { getLandlordListings, getDemoTenant } from "@/lib/data";
import { getPassportFor } from "@/lib/passport-data";
import { getPendingViewingCount } from "@/lib/viewings";
import { formatRM, relativeFromNow } from "@/lib/format";
import { setApplicationStatusAction } from "@/app/(app)/dashboard/actions";
import { createDepositAction } from "@/app/(app)/deposits/actions";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ListingImage } from "@/components/listing/listing-image";
import { ScamBadge } from "@/components/listing/listing-badges";
import { DeleteListingButton } from "@/components/landlord/delete-listing-button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Landlord dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>;
}) {
  const profile = await requireProfile("landlord");
  const listings = await getLandlordListings(profile.id);
  const applications = await getLandlordApplications();
  const sp = await searchParams;
  const pendingViewings = await getPendingViewingCount();
  // Demo applicant Trust Passport (DB-backed per-tenant in production).
  const applicantPassport = await getPassportFor(getDemoTenant());
  const trust = {
    score: applicantPassport.score.value,
    rep: applicantPassport.reputation.avg,
    onTime: applicantPassport.paymentSummary.onTimeCount,
    handle: applicantPassport.handle,
  };
  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {sp.posted && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-safe/10 p-3 text-sm font-medium text-safe">
          <CheckCircle2 className="size-4" /> Listing published! It&apos;s now live on RumahKu.
        </div>
      )}

      {pendingViewings > 0 && (
        <Link
          href="/viewings"
          className="mb-5 flex items-center gap-2 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm font-medium text-warn transition-colors hover:bg-warn/15"
        >
          <CalendarClock className="size-4" />
          {pendingViewings} viewing {pendingViewings === 1 ? "request" : "requests"} awaiting your response
          <span className="ml-auto font-semibold">Review →</span>
        </Link>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {profile.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {profile.isVerified ? (
              <>
                <BadgeCheck className="size-4 text-primary" /> Verified landlord ·{" "}
                {profile.affiliation}
              </>
            ) : (
              "Complete verification to earn a Verified badge."
            )}
          </p>
        </div>
        <ButtonLink href="/dashboard/new" size="lg">
          <Plus /> Add listing
        </ButtonLink>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total listings" value={`${listings.length}`} />
        <Stat label="Active" value={`${activeCount}`} />
        <Stat label="Plan" value="30-day free trial" />
      </div>

      {applications.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
            <Inbox className="size-5" /> Applications
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {applications.filter((a) => a.status === "pending").length} new
            </span>
          </h2>
          <div className="space-y-2">
            {applications.map((a) => (
              <ApplicationRow key={a.id} app={a} trust={trust} />
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-8 mb-3 font-heading text-lg font-bold">Your listings</h2>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Home className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-heading text-lg font-bold">No listings yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Post your first room or property — it only takes a minute, and renters can find
            you right away.
          </p>
          <ButtonLink href="/dashboard/new" className="mt-4">
            <Plus /> Post your first listing
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {listings.map((l) => {
            const area = AREA_BY_ID[l.areaId];
            return (
              <div key={l.id} className="flex gap-3 rounded-xl border border-border p-3">
                <ListingImage
                  seed={l.photos[0] ?? l.id}
                  type={l.propertyType}
                  className="size-20 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold">{l.title}</h3>
                    <DeleteListingButton id={l.id} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {area.name} · {PROPERTY_TYPE_LABEL[l.propertyType]} ·{" "}
                    <span className="font-medium text-foreground">{formatRM(l.price)}</span>/mo
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ScamBadge level={l.scam.level} />
                    <Link
                      href={`/listing/${l.id}`}
                      className="ml-auto text-xs font-medium text-primary hover:underline"
                    >
                      View listing →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-bold">{value}</p>
    </div>
  );
}

function ApplicationRow({
  app,
  trust,
}: {
  app: LandlordApplication;
  trust: { score: number; rep: number; onTime: number; handle: string };
}) {
  const pending = app.status === "pending";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{app.tenantName}</p>
          <p className="text-xs text-muted-foreground">
            for {app.listingTitle} · {relativeFromNow(app.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
            app.status === "accepted"
              ? "bg-safe/10 text-safe"
              : app.status === "declined"
                ? "bg-danger/10 text-danger"
                : "bg-warn/15 text-warn",
          )}
        >
          {app.status}
        </span>
      </div>

      {/* Trust Passport at a glance — the landlord-side payoff of the passport */}
      <Link
        href={`/p/${trust.handle}`}
        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs transition-colors hover:bg-primary/10"
      >
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          <ShieldCheck className="size-3.5" /> Trust Passport
        </span>
        <span className="font-bold text-foreground tabular-nums">{trust.score}</span>
        <span className="inline-flex items-center gap-0.5 text-foreground">
          <Star className="size-3 fill-premium text-premium" /> {trust.rep.toFixed(1)}
        </span>
        <span className="text-muted-foreground">{trust.onTime} on-time payments</span>
        <span className="ml-auto font-medium text-primary">View →</span>
      </Link>

      <p className="mt-2 text-sm text-muted-foreground">{app.message}</p>
      {pending && (
        <div className="mt-3 flex gap-2">
          <form action={setApplicationStatusAction}>
            <input type="hidden" name="id" value={app.id} />
            <input type="hidden" name="status" value="accepted" />
            <Button type="submit" size="sm">
              <Check /> Accept
            </Button>
          </form>
          <form action={setApplicationStatusAction}>
            <input type="hidden" name="id" value={app.id} />
            <input type="hidden" name="status" value="declined" />
            <Button type="submit" size="sm" variant="outline">
              <X /> Decline
            </Button>
          </form>
        </div>
      )}
      {app.status === "accepted" && (
        <form action={createDepositAction} className="mt-3">
          <input type="hidden" name="applicationId" value={app.id} />
          <Button type="submit" size="sm" variant="outline">
            <ShieldCheck /> Start SafeDeposit
          </Button>
        </form>
      )}
    </div>
  );
}
