import Link from "next/link";
import { CalendarClock, Check, Home, X } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getViewings, VIEWING_STATUS_LABEL, type ViewingStatus } from "@/lib/viewings";
import { setViewingStatusAction } from "@/app/(app)/viewings/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Viewings" };

const STATUS_STYLE: Record<ViewingStatus, string> = {
  pending: "bg-warn/15 text-warn",
  confirmed: "bg-safe/10 text-safe",
  declined: "bg-danger/10 text-danger",
};

/** Kota Kinabalu local date + time (UTC+8). */
function whenKK(iso: string): string {
  const d = new Date(Date.parse(iso) + 8 * 3600_000);
  const date = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h < 12 ? "am" : "pm";
  h = h % 12 === 0 ? 12 : h % 12;
  return `${date}, ${h}:${m} ${ap}`;
}

export default async function ViewingsPage() {
  const profile = await requireProfile();
  const viewings = await getViewings();
  const isLandlord = profile.role === "landlord";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {isLandlord ? "Viewing requests" : "My viewings"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isLandlord
          ? "Confirm or decline viewing requests from interested tenants."
          : "Track your viewing requests and confirmed times. Always view before you pay."}
      </p>

      {viewings.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <CalendarClock className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-heading text-lg font-bold">No viewings yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {isLandlord
              ? "When a tenant requests a viewing, it'll show up here."
              : "Open a listing and tap Request a viewing to schedule one."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {viewings.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CalendarClock className="size-4 text-primary" /> {whenKK(v.preferredAt)}
                  </p>
                  <Link
                    href={`/listing/${v.listingId}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Home className="size-3" /> {v.listingTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isLandlord ? "Tenant" : "Landlord"}: {v.otherName}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    STATUS_STYLE[v.status],
                  )}
                >
                  {VIEWING_STATUS_LABEL[v.status]}
                </span>
              </div>

              {v.note && <p className="mt-2 text-sm text-foreground/90">{v.note}</p>}

              {isLandlord && v.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <form action={setViewingStatusAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <Button type="submit" size="sm">
                      <Check /> Confirm
                    </Button>
                  </form>
                  <form action={setViewingStatusAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="status" value="declined" />
                    <Button type="submit" size="sm" variant="outline">
                      <X /> Decline
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
