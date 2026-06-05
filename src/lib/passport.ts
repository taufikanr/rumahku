import type { Profile } from "@/lib/types";

/* ================================================================== */
/* Renter Trust Passport                                              */
/*                                                                     */
/* A portable, verified renter identity that bundles three signals    */
/* no Malaysian rental platform combines today:                       */
/*   1. Credit Builder — verified on-time rent → a RumahKu Rent Score */
/*      (300–850), the data feed that (with a CTOS/Experian partner)   */
/*      lets renters build real credit for their first car/home loan.  */
/*   2. Verified rental history — a tamper-proof "rental CV".          */
/*   3. Two-sided reputation — landlords review tenants, not just the  */
/*      other way around, fixing the trust asymmetry that lets scams   */
/*      thrive.                                                         */
/*                                                                     */
/* The score model is intentionally TRANSPARENT (every factor is       */
/* surfaced) — same philosophy as the scam detector.                   */
/* ================================================================== */

export type RentScoreBand = "building" | "fair" | "good" | "very-good" | "excellent";

export interface ScoreFactor {
  label: string;
  /** Signed contribution to the score. */
  points: number;
  detail: string;
}

export interface RentScore {
  /** 300 (new) – 850 (excellent), CTOS-familiar range. */
  value: number;
  band: RentScoreBand;
  factors: ScoreFactor[];
}

export interface PaymentRecord {
  id: string;
  label: string;
  amount: number;
  paidOn: string;
  onTime: boolean;
}

export interface TenancyRecord {
  id: string;
  property: string;
  area: string;
  landlordName: string;
  landlordVerified: boolean;
  /** "Jan 2025" style label. */
  start: string;
  /** undefined = current tenancy. */
  end?: string;
  months: number;
  /** 0–100 on-time payment rate for this tenancy. */
  onTimeRate: number;
}

/** A landlord's review OF the tenant — the missing half of rental trust. */
export interface TenantReview {
  id: string;
  landlordName: string;
  landlordVerified: boolean;
  rating: number;
  comment: string;
  createdAt: string;
}

export type VerificationKind = "student" | "nric" | "phone" | "email";

export interface Verification {
  kind: VerificationKind;
  label: string;
  verified: boolean;
  detail?: string;
}

export interface PaymentSummary {
  onTimeCount: number;
  lateCount: number;
  /** Consecutive on-time months, most recent run. */
  streak: number;
  totalPaid: number;
  /** 0–100. */
  onTimeRate: number;
}

export interface RenterPassport {
  profile: Pick<
    Profile,
    "id" | "fullName" | "avatarUrl" | "affiliation" | "occupation" | "joinedAt" | "habits"
  >;
  /** Public share handle, e.g. "sara-a". */
  handle: string;
  verifications: Verification[];
  payments: PaymentRecord[];
  paymentSummary: PaymentSummary;
  tenancies: TenancyRecord[];
  reviews: TenantReview[];
  reputation: { avg: number; count: number };
  score: RentScore;
  /** True once the score is reported to a credit bureau (roadmap; false in MVP). */
  creditReported: boolean;
}

/* ------------------------------------------------------------------ */
/* Score band mapping                                                  */
/* ------------------------------------------------------------------ */
export function scoreBand(value: number): RentScoreBand {
  if (value >= 790) return "excellent";
  if (value >= 720) return "very-good";
  if (value >= 650) return "good";
  if (value >= 560) return "fair";
  return "building";
}

export const BAND_LABEL: Record<RentScoreBand, string> = {
  building: "Building",
  fair: "Fair",
  good: "Good",
  "very-good": "Very good",
  excellent: "Excellent",
};

/* ------------------------------------------------------------------ */
/* Transparent Rent Score model (300–850)                              */
/* ------------------------------------------------------------------ */
export interface RentScoreInput {
  onTimeCount: number;
  lateCount: number;
  streak: number;
  /** Total tenancy tenure in months. */
  tenureMonths: number;
  verifiedCount: number;
  /** Average landlord rating of the tenant (0 if none). */
  repAvg: number;
  repCount: number;
}

function clampScore(n: number): number {
  return Math.max(300, Math.min(850, Math.round(n)));
}

export function computeRentScore(input: RentScoreInput): RentScore {
  const factors: ScoreFactor[] = [];
  let raw = 450; // starting baseline for a verified-but-new renter

  const onTimePts = Math.min(150, input.onTimeCount * 9);
  factors.push({
    label: "On-time rent payments",
    points: onTimePts,
    detail: `${input.onTimeCount} payment${input.onTimeCount === 1 ? "" : "s"} made on time`,
  });

  const streakPts = Math.min(50, input.streak * 3);
  factors.push({
    label: "Current on-time streak",
    points: streakPts,
    detail: `${input.streak} consecutive month${input.streak === 1 ? "" : "s"} without a late payment`,
  });

  const tenurePts = Math.min(40, input.tenureMonths * 2);
  factors.push({
    label: "Rental tenure",
    points: tenurePts,
    detail: `${input.tenureMonths} months of verified rental history`,
  });

  const verifyPts = Math.min(40, input.verifiedCount * 10);
  factors.push({
    label: "Identity & verification",
    points: verifyPts,
    detail: `${input.verifiedCount} of 4 trust checks verified`,
  });

  if (input.repCount > 0) {
    const repPts = Math.min(60, Math.max(0, Math.round((input.repAvg - 3) * 30)));
    factors.push({
      label: "Landlord reputation",
      points: repPts,
      detail: `${input.repAvg.toFixed(1)}★ average from ${input.repCount} past landlord${input.repCount === 1 ? "" : "s"}`,
    });
  }

  if (input.lateCount > 0) {
    factors.push({
      label: "Late / missed payments",
      points: -40 * input.lateCount,
      detail: `${input.lateCount} late payment${input.lateCount === 1 ? "" : "s"} on record`,
    });
  }

  raw += factors.reduce((s, f) => s + f.points, 0);
  const value = clampScore(raw);
  return { value, band: scoreBand(value), factors };
}

/** Fraction (0–1) of the 300–850 scale, rounded for SSR/CSR stability. */
export function scoreFraction(value: number): number {
  return Number(((value - 300) / 550).toFixed(3));
}

/* ================================================================== */
/* Demo dataset                                                        */
/*                                                                     */
/* Mirrors the seed.ts pattern: deterministic data (no Date.now at     */
/* import) that powers the logged-in tenant experience. A production   */
/* build swaps this for Supabase tables (payments / tenancies /        */
/* tenant_reviews / verifications) — the compute layer above is        */
/* already DB-swap-ready.                                              */
/* ================================================================== */
const DAY = 86_400_000;
const NOW = Date.parse("2026-06-01T00:00:00Z");
const monthsAgoISO = (m: number) => new Date(NOW - m * 30 * DAY).toISOString();
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Build N monthly on-time rent payments, most recent first. */
function buildPayments(count: number, amount: number): PaymentRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const iso = monthsAgoISO(i);
    return {
      id: `pay-${i}`,
      label: `${monthLabel(iso)} rent`,
      amount,
      paidOn: iso,
      onTime: true,
    };
  });
}

/** Derive the payment summary (counts, streak, totals) from a payment list. */
export function paymentSummaryOf(payments: PaymentRecord[]): PaymentSummary {
  const sorted = [...payments].sort((a, b) => Date.parse(b.paidOn) - Date.parse(a.paidOn));
  const onTimeCount = sorted.filter((p) => p.onTime).length;
  const lateCount = sorted.length - onTimeCount;
  let streak = 0;
  for (const p of sorted) {
    if (p.onTime) streak++;
    else break;
  }
  const totalPaid = sorted.filter((p) => p.onTime).reduce((s, p) => s + p.amount, 0);
  const onTimeRate = sorted.length ? Math.round((onTimeCount / sorted.length) * 100) : 0;
  return { onTimeCount, lateCount, streak, totalPaid, onTimeRate };
}

/** Assemble a passport (pure) from a profile + its records — used for both real and demo data. */
export function assemblePassport(
  profile: RenterPassport["profile"],
  payments: PaymentRecord[],
  tenancies: TenancyRecord[],
  reviews: TenantReview[],
  verifications: Verification[],
): RenterPassport {
  const paymentSummary = paymentSummaryOf(payments);
  const tenureMonths = tenancies.reduce((s, t) => s + t.months, 0);
  const repAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const score = computeRentScore({
    onTimeCount: paymentSummary.onTimeCount,
    lateCount: paymentSummary.lateCount,
    streak: paymentSummary.streak,
    tenureMonths,
    verifiedCount: verifications.filter((v) => v.verified).length,
    repAvg,
    repCount: reviews.length,
  });
  return {
    profile,
    handle: handleFor(profile.fullName),
    verifications,
    payments: [...payments].sort((a, b) => Date.parse(b.paidOn) - Date.parse(a.paidOn)),
    paymentSummary,
    tenancies,
    reviews,
    reputation: { avg: Math.round(repAvg * 10) / 10, count: reviews.length },
    score,
    creditReported: false,
  };
}

/** Showcase passport — the fallback shown when a user has no real records yet. */
export function demoPassportFor(profile: Profile): RenterPassport {
  const RENT = 450;
  const ONTIME = 18;
  const payments = buildPayments(ONTIME, RENT);

  const tenancies: TenancyRecord[] = [
    {
      id: "ten-1",
      property: "Single room · University Apartment, Sepanggar",
      area: "Sepanggar (near UMS)",
      landlordName: "Kelvin Lim",
      landlordVerified: true,
      start: monthLabel(monthsAgoISO(17)),
      months: 18,
      onTimeRate: 100,
    },
    {
      id: "ten-2",
      property: "Shared apartment · Likas",
      area: "Likas",
      landlordName: "Henry Wong",
      landlordVerified: true,
      start: monthLabel(monthsAgoISO(31)),
      end: monthLabel(monthsAgoISO(18)),
      months: 12,
      onTimeRate: 100,
    },
  ];

  const reviews: TenantReview[] = [
    {
      id: "rev-1",
      landlordName: "Kelvin Lim",
      landlordVerified: true,
      rating: 5,
      comment:
        "Paid rent on time every single month and kept the room spotless. The kind of tenant every landlord wants — happy to be a reference.",
      createdAt: monthsAgoISO(1),
    },
    {
      id: "rev-2",
      landlordName: "Henry Wong",
      landlordVerified: true,
      rating: 5,
      comment:
        "Reliable and respectful, no payment issues at all over a full year. Returned the unit in great condition.",
      createdAt: monthsAgoISO(18),
    },
  ];

  const verifications: Verification[] = [
    { kind: "student", label: "UMS student", verified: true, detail: "Verified via student email" },
    { kind: "nric", label: "Identity (NRIC)", verified: true, detail: "eKYC passed" },
    { kind: "phone", label: "Phone number", verified: true, detail: "Mobile verified" },
    { kind: "email", label: "Email address", verified: true },
  ];

  return assemblePassport(
    profileSlice(profile),
    payments,
    tenancies,
    reviews,
    verifications,
  );
}

export function profileSlice(profile: Profile): RenterPassport["profile"] {
  return {
    id: profile.id,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    affiliation: profile.affiliation,
    occupation: profile.occupation,
    joinedAt: profile.joinedAt,
    habits: profile.habits,
  };
}

function handleFor(name: string): string {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]}-${parts[1][0]}` : (parts[0] ?? "renter");
}

/** Default verification set derived from a profile (used when no explicit rows exist). */
export function verificationsFor(profile: Profile): Verification[] {
  const isUms = (profile.affiliation ?? "").toLowerCase().includes("malaysia sabah") ||
    (profile.occupation ?? "").toLowerCase().includes("ums");
  return [
    { kind: "student", label: "UMS student", verified: isUms, detail: isUms ? "Verified via student email" : undefined },
    { kind: "nric", label: "Identity (NRIC)", verified: profile.isVerified, detail: profile.isVerified ? "eKYC passed" : undefined },
    { kind: "phone", label: "Phone number", verified: Boolean(profile.phone), detail: profile.phone ? "Mobile verified" : undefined },
    { kind: "email", label: "Email address", verified: Boolean(profile.email) },
  ];
}
