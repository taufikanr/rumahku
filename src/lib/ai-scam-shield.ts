import { GoogleGenAI } from "@google/genai";
import { RED_FLAG_PHRASES } from "@/lib/scam";
import type { ScamLevel } from "@/lib/types";

/* ================================================================== */
/* Scam Shield                                                         */
/*                                                                     */
/* A self-serve AI scam check for ANY pasted rental text — a listing   */
/* or a WhatsApp/Facebook/Mudah message from a supposed landlord.      */
/* This is the "trust layer on top of where Sabah already rents":      */
/* a renter doesn't have to leave Facebook to be protected — they      */
/* paste the suspicious post here and get an instant verdict.          */
/*                                                                     */
/* Gemini does the analysis; a rule-based scorer is the fallback so it */
/* always works, even with no API key (important for live demos).      */
/* ================================================================== */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface ShieldRedFlag {
  flag: string;
  /** What the scammer is trying to achieve with this tactic. */
  why: string;
}

export interface ShieldResult {
  /** 0 = clearly safe, 100 = clearly a scam. */
  score: number;
  level: ScamLevel;
  /** Short headline, e.g. "Likely a scam". */
  verdict: string;
  summary: string;
  redFlags: ShieldRedFlag[];
  goodSigns: string[];
  /** What the renter should do next. */
  nextSteps: string[];
  /** True when Gemini produced the assessment (vs the rule-based fallback). */
  aiUsed: boolean;
}

export interface ShieldInput {
  text: string;
  price?: number;
  area?: string;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
}
function levelFor(score: number): ScamLevel {
  return score < 25 ? "safe" : score <= 55 ? "caution" : "high";
}
function verdictFor(level: ScamLevel): string {
  return level === "safe" ? "Looks legitimate" : level === "caution" ? "Be careful" : "Likely a scam";
}

/** Plain-language intent behind each rule-based red flag (for the fallback). */
const SCAMMER_INTENT: Record<string, string> = {
  "Asks for deposit before any viewing":
    "Get your money before you can tell the unit isn't theirs — or doesn't exist.",
  "Asks for payment before any viewing":
    "Take payment before you can verify anything.",
  "Asks to pay first ('bayar dulu')": "Pressure you to pay before you can check the unit.",
  "Asks for deposit upfront ('deposit dulu')": "Secure your cash before any proof.",
  "Asks to transfer money first ('transfer dulu')": "Move money to them before you see the place.",
  "Asks to transfer money first": "Move money to them before you see the place.",
  "Pushes an immediate bank-in payment": "Rush you so you don't stop to verify.",
  "Requests Western Union / wire transfer": "Use an untraceable channel that can't be refunded.",
  "Requests a non-refundable booking fee": "Take a fee you can never get back.",
  "Landlord claims to be overseas": "Explain why they 'can't' meet you or show the unit.",
  "Landlord claims to be overseas ('luar negara')": "Explain why they 'can't' show the unit.",
  "Refuses physical viewing": "Stop you seeing that the unit isn't real or isn't theirs.",
  "Refuses physical viewing ('tanpa tengok')": "Stop you discovering the unit isn't theirs.",
  "Creates false urgency to rush payment": "Make you act before you think or verify.",
};

function defaultNextSteps(level: ScamLevel): string[] {
  if (level === "high")
    return [
      "Do not transfer any money, deposit or booking fee.",
      "Insist on viewing the unit in person before paying anything.",
      "Verify the landlord's identity against the unit's ownership.",
      "If it's elsewhere, ask for it to be listed on RumahKu with a Verified Real check.",
    ];
  if (level === "caution")
    return [
      "Arrange a physical viewing before you commit.",
      "Ask specific questions only the real owner would know.",
      "Never pay a deposit before signing a written agreement.",
    ];
  return [
    "Still view the unit in person before paying.",
    "Use a written tenancy agreement.",
    "Pay the deposit only after viewing and signing.",
  ];
}

const SYSTEM = `You are RumahKu's Scam Shield — a rental-scam analyst for Sabah, Malaysia. A renter (often a Universiti Malaysia Sabah student in Kota Kinabalu) pastes a rental listing or a chat/WhatsApp/Facebook message from a supposed landlord. Judge how likely it is to be a scam and tell them exactly what to do.

Weigh these signals (English or Malay):
- "Too good to be true" pricing (far below market) — the #1 red flag.
- Pressure to pay before any viewing: "deposit before viewing", "bayar dulu", "transfer dulu", "bank in now", non-refundable "booking fee".
- Landlord claims to be away/overseas ("luar negara", "outstation"), sends an "agent" to collect, or refuses a physical viewing ("no viewing", "tanpa tengok").
- False urgency ("many people want it", "today only"), wire transfer / e-wallet to a personal account, or asking for IC / bank details upfront.
- Vague, copy-pasted, or stock-photo-sounding descriptions.
Good signs: offers a real viewing, willing to use a proper tenancy agreement, verifiable identity, fair price, answers specific questions.

Respond ONLY with a JSON object of EXACTLY this shape (no markdown, no extra text):
{"score": <integer 0-100>, "level": "safe"|"caution"|"high", "verdict": "<3-5 word headline>", "summary": "<one friendly sentence of advice>", "redFlags": [{"flag":"<short>","why":"<one sentence: what the scammer is trying to do>"}], "goodSigns": [<short strings>], "nextSteps": [<2-4 short imperative actions for the renter>]}

score: 0 = clearly safe, 100 = clearly a scam. level: "safe" if score<25, "caution" if 25-55, "high" if >55. Max 6 redFlags. Always include nextSteps.`;

/** AI scam analysis of pasted text via Gemini. Null on no key / failure → caller falls back. */
export async function aiScamShield(input: ShieldInput): Promise<ShieldResult | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const ctx = [
      input.price ? `Stated rent: RM${input.price}/month` : null,
      input.area ? `Area: ${input.area}, Kota Kinabalu` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `${ctx ? ctx + "\n\n" : ""}Pasted listing / message:\n"""${input.text.slice(0, 4000)}"""`,
      config: { systemInstruction: SYSTEM, responseMimeType: "application/json", temperature: 0.2 },
    });

    const text = res.text;
    if (!text) return null;
    const out = JSON.parse(text) as {
      score?: number;
      level?: string;
      verdict?: string;
      summary?: string;
      redFlags?: unknown;
      goodSigns?: unknown;
      nextSteps?: unknown;
    };

    const score = clamp(Number(out.score));
    const level: ScamLevel = ["safe", "caution", "high"].includes(out.level ?? "")
      ? (out.level as ScamLevel)
      : levelFor(score);

    const redFlags: ShieldRedFlag[] = Array.isArray(out.redFlags)
      ? out.redFlags
          .map((r) => {
            const o = r as { flag?: unknown; why?: unknown };
            return { flag: String(o?.flag ?? ""), why: String(o?.why ?? "") };
          })
          .filter((r) => r.flag)
          .slice(0, 6)
      : [];

    return {
      score,
      level,
      verdict: String(out.verdict ?? verdictFor(level)),
      summary: String(out.summary ?? ""),
      redFlags,
      goodSigns: Array.isArray(out.goodSigns) ? out.goodSigns.map(String).slice(0, 6) : [],
      nextSteps: Array.isArray(out.nextSteps) ? out.nextSteps.map(String).slice(0, 4) : defaultNextSteps(level),
      aiUsed: true,
    };
  } catch (err) {
    console.error("aiScamShield (gemini) failed:", err);
    return null;
  }
}

/** Rule-based fallback so Scam Shield always returns a useful verdict. */
export function ruleScamShield(input: ShieldInput): ShieldResult {
  const text = input.text.toLowerCase();
  let score = 8;
  const redFlags: ShieldRedFlag[] = [];
  const seen = new Set<string>();

  for (const { phrase, reason } of RED_FLAG_PHRASES) {
    if (text.includes(phrase) && !seen.has(reason)) {
      seen.add(reason);
      redFlags.push({ flag: reason, why: SCAMMER_INTENT[reason] ?? "A common tactic used in rental scams." });
    }
  }
  score += Math.min(70, seen.size * 18);

  const goodSigns: string[] = [];
  if (/\b(view|viewing|tengok|appointment|see the (unit|room|place))\b/i.test(input.text)) {
    score -= 12;
    goodSigns.push("Offers a physical viewing");
  }
  if (/\b(agreement|tenancy|contract|perjanjian)\b/i.test(input.text)) {
    score -= 8;
    goodSigns.push("Mentions a proper tenancy agreement");
  }
  if (/\b(i\/?c|mykad|ic number|nombor ic)\b/i.test(input.text)) {
    score += 12;
    redFlags.push({
      flag: "Asks for IC / personal details upfront",
      why: "Identity details aren't needed before a viewing — a sign of phishing.",
    });
  }
  if (input.text.trim().length < 40) {
    score += 10;
    redFlags.push({
      flag: "Very little detail",
      why: "Genuine listings usually describe the unit, the rules, and a viewing.",
    });
  }

  score = clamp(score);
  const level = levelFor(score);
  return {
    score,
    level,
    verdict: verdictFor(level),
    summary:
      level === "high"
        ? "Strong scam signals — do not pay anything before you verify in person."
        : level === "caution"
          ? "Some risk here — verify a few things before you pay."
          : "No major scam signals, but always view the unit before you pay.",
    redFlags: redFlags.slice(0, 6),
    goodSigns: goodSigns.slice(0, 4),
    nextSteps: defaultNextSteps(level),
    aiUsed: false,
  };
}
