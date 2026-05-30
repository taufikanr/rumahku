import { GoogleGenAI } from "@google/genai";
import type { ScamLevel, ScamRisk } from "@/lib/types";

// Gemini Flash on the free tier — the right tier for fast, cheap (free) classification.
// Override with GEMINI_MODEL if needed.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface AiScamInput {
  title: string;
  description: string;
  areaName: string;
  propertyType: string;
  price: number;
  expectedPrice: number;
  isVerifiedLandlord: boolean;
  photoCount: number;
  depositMonths: number;
}

const SYSTEM = `You are RumahKu's rental-scam analyst for Sabah, Malaysia. You assess whether a rental listing is likely a scam, protecting tenants (often UMS students) from common local rental fraud.

Weigh these signals:
- Price far below the area average for that property type is the #1 red flag ("too good to be true").
- Unverified landlord identity raises risk; a verified (KYC) landlord lowers it.
- Scam-language in the description, in English or Malay: "deposit before viewing", "transfer dulu", "bayar dulu", "bank in now", "overseas"/"luar negara", "no viewing"/"tanpa tengok", false urgency, non-refundable booking fees, Western Union/wire transfer.
- Very few photos raises risk; several photos lowers it.
- Unusually high deposit (more than 3 months) raises risk.

Respond ONLY with a JSON object of EXACTLY this shape (no markdown, no extra text):
{"score": <integer 0-100>, "level": "safe" | "caution" | "high", "reasons": [<short strings, max 6>], "positives": [<short strings, max 6>], "summary": "<one friendly sentence of advice for the renter>"}

score: 0 = clearly safe, 100 = clearly a scam. level: "safe" if score < 25, "caution" if 25-55, "high" if > 55. "reasons" are the red flags; "positives" are the good/trust signals.`;

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
}
function levelFor(score: number): ScamLevel {
  return score < 25 ? "safe" : score <= 55 ? "caution" : "high";
}

/**
 * AI scam assessment via Google Gemini (free tier). Returns null when no API key
 * is set or the call fails — callers fall back to the rule-based scorer.
 */
export async function aiScamCheck(input: AiScamInput): Promise<ScamRisk | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `Assess this listing:
Title: ${input.title}
Type: ${input.propertyType} in ${input.areaName}, Kota Kinabalu
Asking rent: RM${input.price}/month (area average for this type: RM${input.expectedPrice})
Deposit: ${input.depositMonths.toFixed(1)} months of rent
Landlord verified (KYC): ${input.isVerifiedLandlord ? "yes" : "no"}
Photos provided: ${input.photoCount}
Description: """${input.description}"""`,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = res.text;
    if (!text) return null;
    const out = JSON.parse(text) as {
      score?: number;
      level?: string;
      reasons?: unknown;
      positives?: unknown;
      summary?: string;
    };

    const score = clamp(Number(out.score));
    const level: ScamLevel = ["safe", "caution", "high"].includes(out.level ?? "")
      ? (out.level as ScamLevel)
      : levelFor(score);

    return {
      score,
      level,
      reasons: Array.isArray(out.reasons) ? out.reasons.map(String).slice(0, 6) : [],
      positives: Array.isArray(out.positives) ? out.positives.map(String).slice(0, 6) : [],
      summary: String(out.summary ?? ""),
      aiUsed: true,
    };
  } catch (err) {
    console.error("aiScamCheck (gemini) failed:", err);
    return null;
  }
}
