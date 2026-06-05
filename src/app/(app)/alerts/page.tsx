import Link from "next/link";
import { Bell, BellOff, Search, Trash2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getSavedSearches, queryToHref } from "@/lib/searches";
import { relativeFromNow } from "@/lib/format";
import { deleteSearchAction, toggleNotifyAction } from "@/app/(app)/alerts/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Saved searches" };

export default async function AlertsPage() {
  await requireProfile();
  const searches = await getSavedSearches();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Saved searches &amp; alerts
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Save a search and RumahKu tracks new matching rooms for you — so you never miss the right
        place.
      </p>

      {searches.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Search className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-heading text-lg font-bold">No saved searches yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Set your filters on Browse, then tap <span className="font-medium">Save search</span>{" "}
            to start getting alerts.
          </p>
          <Button className="mt-4" render={<Link href="/browse" />} nativeButton={false}>
            Browse rooms
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {searches.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={queryToHref(s.query)} className="group min-w-0 flex-1">
                  <p className="truncate font-semibold group-hover:text-primary">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Saved {relativeFromNow(s.createdAt)}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <form action={toggleNotifyAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="notify" value={s.notify ? "0" : "1"} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={s.notify ? "Mute alerts" : "Enable alerts"}
                    >
                      {s.notify ? (
                        <Bell className="size-4 text-primary" />
                      ) : (
                        <BellOff className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </form>
                  <form action={deleteSearchAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Delete search">
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={queryToHref(s.query)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/70"
                >
                  <Search className="size-3.5" /> {s.matchCount} matching now
                </Link>
                {s.newCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {s.newCount} new since saved
                  </span>
                )}
              </div>
            </div>
          ))}
          <p className="px-1 text-xs text-muted-foreground">
            Email &amp; push alerts for new matches are delivered by a scheduled job in production.
          </p>
        </div>
      )}
    </div>
  );
}
