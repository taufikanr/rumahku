import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FeatureOrbital } from "@/components/feature-orbital";
import { RESEARCH } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export default async function LandingPage() {
  const lang = await getLang();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> {t(lang, "hero.badge")}
            </span>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t(lang, "hero.title")}{" "}
              <span className="text-primary">{t(lang, "hero.titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              {t(lang, "hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/browse" size="lg" className="h-12 px-6 text-base">
                <Search /> {t(lang, "hero.browseCta")}
              </ButtonLink>
              <ButtonLink
                href="/signup?role=landlord"
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                {t(lang, "hero.listCta")} <ArrowRight />
              </ButtonLink>
            </div>
            <Link
              href="/scam-shield"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal hover:underline"
            >
              <Sparkles className="size-4" /> Already found a room elsewhere? Check it with Scam
              Shield →
            </Link>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> {t(lang, "hero.verifiedLandlords")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-safe" /> {t(lang, "hero.scamProtection")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scale className="size-4 text-primary" /> {t(lang, "hero.fairPrice")}
              </span>
            </div>
          </div>

          {/* Product preview card */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/15 to-safe/15 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
              <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary/20 via-accent to-safe/15">
                <MapPin className="size-10 text-primary/40" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-safe px-2.5 py-1 text-xs font-semibold text-safe-foreground shadow">
                  <ShieldCheck className="size-3.5" /> Scam-safe
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-primary shadow">
                  <BadgeCheck className="size-3.5" /> Verified
                </span>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-bold">Cozy room near UMS</h3>
                    <p className="text-sm text-muted-foreground">Sepanggar · 6 min to campus</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg font-bold">RM420</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-safe/10 px-2.5 py-1 text-xs font-medium text-safe">
                  <TrendingDown className="size-3.5" /> 12% below area average — fair deal
                </span>
                <div className="flex items-center gap-2 border-t border-border/70 pt-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">KL</span>
                  <div className="text-xs">
                    <p className="font-medium">Kelvin · Verified landlord</p>
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Star className="size-3 fill-premium text-premium" /> 4.8 · 23 reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip — validated research */}
      <section className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          <Stat value={`${RESEARCH.scamAffectedPct}%`} label="have faced a rental scam" />
          <Stat value={`${RESEARCH.housemateProblemPct}%`} label="had housemate problems" />
          <Stat value={`${RESEARCH.interestedPct}%`} label="want a Sabah-only app" />
          <Stat value={`${RESEARCH.surveyN + RESEARCH.interviewN}+`} label="Sabah renters researched" />
        </div>
      </section>

      {/* Scam Shield showcase */}
      <section className="border-b border-border/70 bg-gradient-to-br from-brand-teal/10 via-background to-background">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
              <Sparkles className="size-3.5" /> New · AI Scam Shield
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Found a room on Facebook? Check it{" "}
              <span className="text-brand-teal">before you pay.</span>
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              You don&apos;t have to leave where you already search. Paste any listing or WhatsApp
              message and our AI flags the scam signals in seconds — then tells you exactly what to
              do next. Free, no account needed.
            </p>
            <ButtonLink href="/scam-shield" size="lg" className="mt-6 h-12 px-6 text-base">
              <Sparkles /> Try Scam Shield free
            </ButtonLink>
          </div>

          {/* Mock verdict */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-danger/10 to-brand-teal/15 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-xl">
              <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground italic">
                &ldquo;Luxury condo near UMS, only RM350! I&apos;m overseas so no viewing — transfer
                deposit dulu to lock it, many people want. Bank in today.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <p className="font-heading text-lg font-extrabold text-danger">Likely a scam</p>
                  <p className="text-xs text-muted-foreground">Scam risk 92/100</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-danger" /> Price far below market — too
                  good to be true
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-danger" /> Refuses viewing &amp; claims to
                  be overseas
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-0.5 size-4 shrink-0 text-danger" /> Pushes a deposit before
                  viewing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features — interactive orbital */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.14),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-3xl px-4 pt-16 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything Facebook groups and Mudah can&apos;t give you
          </h2>
          <p className="mt-3 text-white/70">
            Tap a feature to see how it works. Every one was directly requested by the
            Sabah renters and landlords we interviewed.
          </p>
        </div>
        <FeatureOrbital />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/70 bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Find a safe room in 3 steps
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step
              n={1}
              title="Search verified rooms"
              desc="Filter by area, price, and distance to UMS or your workplace."
            />
            <Step
              n={2}
              title="Check safety & price"
              desc="Read the scam-risk score and fair-price verdict before you commit."
            />
            <Step
              n={3}
              title="Chat & apply"
              desc="Message the verified landlord on WhatsApp and apply with confidence."
            />
          </div>
        </div>
      </section>

      {/* For landlords */}
      <section id="for-landlords" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-accent/50 to-card p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Landlords: fill rooms faster with renters who trust you
              </h2>
              <p className="mt-3 text-muted-foreground">
                Get a Verified badge, screen tenants, and reach Sabah&apos;s renters directly.
                Start with a <strong className="text-foreground">30-day free trial</strong> — no
                commitment.
              </p>
              <ButtonLink href="/signup?role=landlord" size="lg" className="mt-6 h-12 px-6 text-base">
                List your property free <ArrowRight />
              </ButtonLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PriceTier name="Basic" price="RM39" note="1–2 properties" />
              <PriceTier name="Pro" price="RM120" note="Active agents" highlight />
              <PriceTier name="Enterprise" price="RM399" note="Agencies" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your next home in Sabah is one safe search away
          </h2>
          <div className="mt-7 flex justify-center">
            <ButtonLink href="/browse" size="lg" className="h-12 px-7 text-base">
              <Search /> Start browsing
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">
        {n}
      </span>
      <h3 className="mt-4 font-heading text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function PriceTier({
  name,
  price,
  note,
  highlight,
}: {
  name: string;
  price: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-medium text-muted-foreground">{name}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold">{price}</p>
      <p className="text-xs text-muted-foreground">/mo · {note}</p>
    </div>
  );
}
