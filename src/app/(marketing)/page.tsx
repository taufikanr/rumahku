import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { FeatureOrbital } from "@/components/feature-orbital";
import { RESEARCH } from "@/lib/constants";

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> Built for Sabah renters
            </span>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Rent in Sabah <span className="text-primary">without the scams.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Verified listings, an AI scam check, fair-price insights, and compatible
              housemates — all in one app made for Kota Kinabalu. No more risky
              Facebook posts.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/browse" size="lg" className="h-12 px-6 text-base">
                <Search /> Browse rooms in KK
              </ButtonLink>
              <ButtonLink
                href="/signup?role=landlord"
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                List your property <ArrowRight />
              </ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> Verified landlords
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-safe" /> Scam protection
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scale className="size-4 text-primary" /> Fair-price check
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
