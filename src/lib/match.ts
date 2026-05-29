import type { Housemate, LifestyleHabits } from "@/lib/types";

const SLEEP = ["early", "flexible", "late"] as const;
const CLEAN = ["relaxed", "tidy", "very-tidy"] as const;
const SOCIAL = ["homebody", "balanced", "social"] as const;
const NOISE = ["quiet", "moderate", "lively"] as const;

/** Similarity (0–1) for 3-level ordinal scales: same = 1, adjacent = 0.5, opposite = 0. */
function ordinalSim(a: number, b: number): number {
  return 1 - Math.abs(a - b) / 2;
}

function pairScore(a: LifestyleHabits, b: LifestyleHabits): number {
  const sleep = ordinalSim(SLEEP.indexOf(a.sleep), SLEEP.indexOf(b.sleep));
  const clean = ordinalSim(CLEAN.indexOf(a.cleanliness), CLEAN.indexOf(b.cleanliness));
  const social = ordinalSim(SOCIAL.indexOf(a.social), SOCIAL.indexOf(b.social));
  const noise = ordinalSim(NOISE.indexOf(a.noise), NOISE.indexOf(b.noise));
  const smoking = a.smoking === b.smoking ? 1 : 0;

  // Cleanliness, noise and smoking are the biggest friction points (validated in interviews).
  return (
    clean * 0.25 + noise * 0.2 + smoking * 0.2 + sleep * 0.18 + social * 0.17
  );
}

/**
 * Compatibility (0–100) between a tenant and a unit's current housemates.
 * Returns undefined when there are no current housemates to compare against.
 */
export function computeHousemateMatch(
  user: LifestyleHabits,
  housemates: Housemate[],
): number | undefined {
  if (!housemates.length) return undefined;
  const total = housemates.reduce((sum, h) => sum + pairScore(user, h.habits), 0);
  return Math.round((total / housemates.length) * 100);
}

export function matchLabel(score: number): string {
  if (score >= 80) return "Great match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Fair match";
  return "Low match";
}

/** Friendly labels for a person's lifestyle habits. */
export function describeHabits(h: LifestyleHabits): string[] {
  return [
    { early: "Early riser", late: "Night owl", flexible: "Flexible hours" }[h.sleep],
    { relaxed: "Relaxed", tidy: "Tidy", "very-tidy": "Very tidy" }[h.cleanliness],
    { homebody: "Homebody", balanced: "Balanced", social: "Social" }[h.social],
    { quiet: "Quiet", moderate: "Moderate", lively: "Lively" }[h.noise],
    h.smoking === "non-smoker" ? "Non-smoker" : "Smoker",
  ];
}
