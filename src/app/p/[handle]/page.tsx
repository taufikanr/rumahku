import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Flame,
  Home,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { getDemoTenant } from "@/lib/data";
import { formatRM, formatDate } from "@/lib/format";
import { getPassportFor } from "@/lib/passport-data";
import { ScoreGauge } from "@/components/passport/score-gauge";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export const metadata = { title: "Verified Renter · RumahKu" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-premium text-premium" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  await params; // handle reserved for real lookups; demo always shows the showcase renter
  const p = await getPassportFor(getDemoTenant());
  const { score, paymentSummary: ps } = p;

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-accent/30 to-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="RumahKu home">
            <Logo />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-safe/10 px-3 py-1 text-xs font-semibold text-safe">
            <ShieldCheck className="size-4" /> Verified by RumahKu
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-center text-sm text-muted-foreground">Renter Trust Passport</p>
        <h1 className="mt-1 text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {p.profile.fullName}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {p.profile.occupation}
          {p.profile.affiliation ? ` · ${p.profile.affiliation}` : ""} · Member since{" "}
          {formatDate(p.profile.joinedAt)}
        </p>

        <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/70 bg-card p-6">
          <ScoreGauge score={score} />
          {p.reputation.count > 0 && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm">
              <Stars rating={Math.round(p.reputation.avg)} />
              <span className="font-bold">{p.reputation.avg.toFixed(1)}</span>
              <span className="text-muted-foreground">from {p.reputation.count} landlords</span>
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat icon={CheckCircle2} value={`${ps.onTimeCount}`} label="on-time payments" tone="text-safe" />
          <Stat icon={Flame} value={`${ps.streak} mo`} label="on-time streak" tone="text-warn" />
          <Stat icon={Wallet} value={formatRM(ps.totalPaid)} label="rent verified" tone="text-primary" />
        </div>

        {/* Verifications */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {p.verifications
            .filter((v) => v.verified)
            .map((v) => (
              <span
                key={v.kind}
                className="inline-flex items-center gap-1.5 rounded-full border border-safe/30 bg-safe/5 px-3 py-1 text-xs font-medium text-safe"
              >
                <BadgeCheck className="size-3.5" /> {v.label}
              </span>
            ))}
        </div>

        {/* Rental history */}
        <h2 className="mt-8 flex items-center gap-2 font-heading text-base font-bold">
          <Home className="size-4 text-primary" /> Rental history
        </h2>
        <div className="mt-3 space-y-2">
          {p.tenancies.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.property}</p>
                <p className="text-xs text-muted-foreground">
                  {t.start} – {t.end ?? "Present"} · {t.months} months · {t.landlordName}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-safe/10 px-2 py-0.5 text-xs font-medium text-safe">
                {t.onTimeRate}% on time
              </span>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <h2 className="mt-8 flex items-center gap-2 font-heading text-base font-bold">
          <Star className="size-4 text-primary" /> What landlords say
        </h2>
        <div className="mt-3 space-y-3">
          {p.reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  {r.landlordName}
                  {r.landlordVerified && <BadgeCheck className="size-4 text-primary" />}
                </span>
                <Stars rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-foreground/90">“{r.comment}”</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-sm text-foreground/90">
            This renter&apos;s trust history is verified and portable on RumahKu.
          </p>
          <Link
            href="/signup"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            List your room on RumahKu
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Home;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3 text-center">
      <Icon className={cn("mx-auto size-4", tone)} />
      <p className="mt-1 font-heading text-lg font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
