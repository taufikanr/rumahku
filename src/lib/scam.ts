import type { ScamRisk, ScamLevel } from "@/lib/types";

export interface ScamSignalInput {
  price: number;
  /** Expected price for this property type + area (from pricing engine). */
  expectedPrice: number;
  isVerifiedLandlord: boolean;
  photoCount: number;
  description: string;
  /** deposit / monthly price. */
  depositMonths: number;
  /** Age of the landlord's account in days. */
  landlordAgeDays: number;
  hasDigitalContract?: boolean;
}

/** Phrases that commonly signal rental scams in Sabah (English + Malay). */
export const RED_FLAG_PHRASES: { phrase: string; reason: string }[] = [
  { phrase: "deposit before viewing", reason: "Asks for deposit before any viewing" },
  { phrase: "pay before viewing", reason: "Asks for payment before any viewing" },
  { phrase: "bayar dulu", reason: "Asks to pay first ('bayar dulu')" },
  { phrase: "deposit dulu", reason: "Asks for deposit upfront ('deposit dulu')" },
  { phrase: "transfer dulu", reason: "Asks to transfer money first ('transfer dulu')" },
  { phrase: "transfer first", reason: "Asks to transfer money first" },
  { phrase: "bank in", reason: "Pushes an immediate bank-in payment" },
  { phrase: "western union", reason: "Requests Western Union / wire transfer" },
  { phrase: "booking fee", reason: "Requests a non-refundable booking fee" },
  { phrase: "overseas", reason: "Landlord claims to be overseas" },
  { phrase: "luar negara", reason: "Landlord claims to be overseas ('luar negara')" },
  { phrase: "no viewing", reason: "Refuses physical viewing" },
  { phrase: "tanpa tengok", reason: "Refuses physical viewing ('tanpa tengok')" },
  { phrase: "urgent", reason: "Creates false urgency to rush payment" },
];

function levelFor(score: number): ScamLevel {
  if (score < 25) return "safe";
  if (score <= 55) return "caution";
  return "high";
}

function summaryFor(level: ScamLevel): string {
  switch (level) {
    case "safe":
      return "This listing looks safe — no major scam signals detected.";
    case "caution":
      return "Be a little careful — verify a few details before paying anything.";
    case "high":
      return "High scam risk — do not pay a deposit before verifying in person.";
  }
}

/** Rule-based scam risk score (0 safe – 100 high) with explanations. */
export function computeScamRisk(input: ScamSignalInput): ScamRisk {
  const reasons: string[] = [];
  const positives: string[] = [];
  let score = 0;

  // 1. Price too good to be true
  const ratio = input.expectedPrice > 0 ? input.price / input.expectedPrice : 1;
  if (ratio < 0.5) {
    score += 45;
    reasons.push("Price is far below the area average (too good to be true)");
  } else if (ratio < 0.65) {
    score += 25;
    reasons.push("Price is well below the area average");
  } else if (ratio < 0.78) {
    score += 10;
    reasons.push("Price is somewhat below the area average");
  } else if (ratio <= 1.25) {
    positives.push("Price is consistent with the area");
  }

  // 2. Landlord verification
  if (input.isVerifiedLandlord) {
    score -= 15;
    positives.push("Verified landlord identity (KYC passed)");
  } else {
    score += 20;
    reasons.push("Landlord identity is not yet verified");
  }

  // 3. Photos
  if (input.photoCount === 0) {
    score += 20;
    reasons.push("No photos provided");
  } else if (input.photoCount === 1) {
    score += 10;
    reasons.push("Only a single photo provided");
  } else if (input.photoCount >= 4) {
    score -= 5;
    positives.push("Multiple recent photos provided");
  }

  // 4. Red-flag phrases in description
  const text = input.description.toLowerCase();
  const matched = new Set<string>();
  for (const { phrase, reason } of RED_FLAG_PHRASES) {
    if (text.includes(phrase)) matched.add(reason);
  }
  if (matched.size > 0) {
    score += Math.min(36, matched.size * 12);
    reasons.push(...matched);
  }

  // 5. Unusual deposit
  if (input.depositMonths > 3) {
    score += 15;
    reasons.push("Deposit is unusually high (more than 3 months)");
  }

  // 6. Brand-new landlord account
  if (input.landlordAgeDays < 14) {
    score += 10;
    reasons.push("Landlord account was created very recently");
  }

  // 7. Digital contract on offer
  if (input.hasDigitalContract) {
    score -= 5;
    positives.push("Offers a digital tenancy agreement");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level = levelFor(score);

  return {
    score,
    level,
    reasons,
    positives,
    aiUsed: false,
    summary: summaryFor(level),
  };
}
