import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Flame,
  GraduationCap,
  Home,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { formatRM, formatDate } from "@/lib/format";
import {
  BAND_LABEL,
  type RentScoreBand,
  type Verification,
  type VerificationKind,
} from "@/lib/passport";
import { getPassportFor } from "@/lib/passport-data";
import { ScoreGauge } from "@/components/passport/score-gauge";
import { SharePassportButton } from "@/components/passport/share-button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export const metadata = { title: "Trust Passport" };

const VERIFY_ICON: Record<VerificationKind, typeof GraduationCap> = {
  student: GraduationCap,
  nric: IdCard,
  phone: Phone,
  email: Mail,
};

const NEXT_BAND: { at: number; band: RentScoreBand }[] = [
  { at: 560, band: "fair" },
  { at: 650, band: "good" },
  { at: 720, band: "very-good" },
  { at: 790, band: "excellent" },
];

function nextMilestone(value: number) {
  return NEXT_BAND.find((b) => b.at > value) ?? null;
}

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

export default async function PassportPage() {
  const profile = await requireProfile();
  const lang = await getLang();
  const p = await getPassportFor(profile);
  const { score, paymentSummary: ps } = p;
  const next = nextMilestone(score.value);
  const verifiedCount = p.verifications.filter((v) => v.verified).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {t(lang, "passport.eyebrow")}
            </span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {p.profile.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.profile.occupation ?? "Renter"}
            {p.profile.affiliation ? ` · ${p.profile.affiliation}` : ""} · Member since{" "}
            {formatDate(p.profile.joinedAt)}
          </p>
        </div>
        <SharePassportButton handle={p.handle} />
      </div>

      {/* Hero: score + credit builder */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-6">
          <ScoreGauge score={score} />
          {next && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{next.at - score.value} points</span>{" "}
              to {BAND_LABEL[next.band]}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/30 p-6">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-5" />
            <h2 className="font-heading text-lg font-bold">{t(lang, "passport.creditBuilder")}</h2>
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {p.creditReported ? "Reporting to bureau" : "Ready to report"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Every on-time rent payment on RumahKu builds your{" "}
            <span className="font-semibold">verified payment record</span> — turning rent you
            already pay into credit history for your first{" "}
            <span className="font-semibold">car or home loan</span>.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <HeroStat icon={CheckCircle2} value={`${ps.onTimeCount}`} label="on-time payments" tone="safe" />
            <HeroStat icon={Flame} value={`${ps.streak} mo`} label="current streak" tone="warn" />
            <HeroStat icon={Wallet} value={formatRM(ps.totalPaid)} label="rent verified" tone="primary" />
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-background/60 p-3 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              Roadmap: with our credit-bureau partner (CTOS / Experian Malaysia), this record
              becomes a reportable tradeline — a Malaysian first. Today it&apos;s a verified
              score landlords already trust.
            </span>
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <Section title={t(lang, "passport.howBuilt")} icon={TrendingUp}>
        <div className="rounded-2xl border border-border/70 bg-card">
          {score.factors.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3",
                i > 0 && "border-t border-border/60",
              )}
            >
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-bold tabular-nums",
                  f.points >= 0 ? "text-safe" : "text-danger",
                )}
              >
                {f.points >= 0 ? "+" : ""}
                {f.points}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Transparent by design — like our scam detector, every factor is shown, nothing hidden.
        </p>
      </Section>

      {/* Payment history */}
      <Section title={t(lang, "passport.payments")} icon={CheckCircle2}>
        <div className="rounded-2xl border border-border/70 bg-card p-2">
          <div className="grid gap-1 sm:grid-cols-2">
            {p.payments.slice(0, 8).map((pay) => (
              <div key={pay.id} className="flex items-center gap-3 rounded-lg px-3 py-2">
                <CheckCircle2 className="size-4 shrink-0 text-safe" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pay.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Paid {formatDate(pay.paidOn)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatRM(pay.amount)}</span>
              </div>
            ))}
          </div>
          {p.payments.length > 8 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              + {p.payments.length - 8} more on-time payments on record
            </p>
          )}
        </div>
      </Section>

      {/* Rental history */}
      <Section title={t(lang, "passport.rentalHistory")} icon={Home}>
        <div className="space-y-3">
          {p.tenancies.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Home className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.property}</p>
                <p className="text-xs text-muted-foreground">
                  {t.start} – {t.end ?? "Present"} · {t.months} months
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    Landlord: {t.landlordName}
                    {t.landlordVerified && <BadgeCheck className="size-3.5 text-primary" />}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-safe/10 px-2 py-0.5 font-medium text-safe">
                    <CheckCircle2 className="size-3" /> {t.onTimeRate}% on time
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Reputation — landlord reviews of the tenant */}
      <Section
        title={t(lang, "passport.reviews")}
        icon={Star}
        aside={
          p.reputation.count > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Stars rating={Math.round(p.reputation.avg)} />
              <span className="font-bold">{p.reputation.avg.toFixed(1)}</span>
              <span className="text-muted-foreground">({p.reputation.count})</span>
            </span>
          ) : undefined
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {p.reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
                  {r.landlordName}
                  {r.landlordVerified && <BadgeCheck className="size-4 text-primary" />}
                </span>
                <Stars rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-foreground/90">“{r.comment}”</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Two-sided trust: landlords review tenants too — the half of rental reputation that no
          Malaysian platform captures today.
        </p>
      </Section>

      {/* Verifications */}
      <Section title={`${t(lang, "passport.identity")} (${verifiedCount}/4)`} icon={BadgeCheck}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {p.verifications.map((v) => (
            <VerificationChip key={v.kind} v={v} />
          ))}
        </div>
      </Section>

      {/* Bottom CTA */}
      <div className="mt-8 rounded-2xl border border-border/70 bg-muted/30 p-6 text-center">
        <h3 className="font-heading text-lg font-bold">{t(lang, "passport.bottomTitle")}</h3>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
          Share your Trust Passport with any landlord to skip the guesswork — a verified history
          of on-time payments and great reviews means you get the room, and a head start on your
          credit.
        </p>
        <div className="mt-4 flex justify-center">
          <SharePassportButton handle={p.handle} />
        </div>
      </div>
    </div>
  );
}

/* ---- small presentational helpers ---- */

function Section({
  title,
  icon: Icon,
  aside,
  children,
}: {
  title: string;
  icon: typeof Home;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Icon className="size-5 text-primary" />
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const TONE: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  primary: "text-primary",
};

function HeroStat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Home;
  value: string;
  label: string;
  tone: keyof typeof TONE;
}) {
  return (
    <div className="rounded-xl bg-background/70 p-3 text-center">
      <Icon className={cn("mx-auto size-4", TONE[tone])} />
      <p className="mt-1 font-heading text-lg font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function VerificationChip({ v }: { v: Verification }) {
  const Icon = VERIFY_ICON[v.kind];
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center",
        v.verified ? "border-safe/30 bg-safe/5" : "border-border/70 bg-card",
      )}
    >
      <div
        className={cn(
          "relative flex size-9 items-center justify-center rounded-xl",
          v.verified ? "bg-safe/15 text-safe" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
        {v.verified && (
          <BadgeCheck className="absolute -right-1 -top-1 size-4 rounded-full bg-background text-safe" />
        )}
      </div>
      <p className="text-xs font-medium leading-tight">{v.label}</p>
      {v.detail && <p className="text-[10px] leading-tight text-muted-foreground">{v.detail}</p>}
    </div>
  );
}
