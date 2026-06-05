import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface ConciergeListing {
  id: string;
  title: string;
  area: string;
  type: string;
  price: number;
  distanceKm: number;
  scamLevel: "safe" | "caution" | "high";
  gender: string;
  beds: number;
}

export interface ConciergeTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ConciergeResult {
  reply: string;
  listingIds: string[];
}

const SYSTEM = `You are RumahKu's friendly rental concierge for Sabah, Malaysia. You help renters — mostly Universiti Malaysia Sabah (UMS) students and young workers in Kota Kinabalu — find a safe, fair-priced room or home.

Rules:
- Recommend ONLY from the listings provided in the user's message. Never invent listings, prices, or areas.
- Prefer listings that are scam-safe ("safe"), fairly priced, close to UMS, and that match the renter's stated budget, area, gender preference and room type.
- Be warm, concise (2-4 sentences), and practical. Mention WHY you picked something (e.g. "scam-safe and 5 min from UMS").
- If nothing fits, say so honestly and suggest how to adjust the search (budget/area/distance).
- Gently reinforce safety: never pay a deposit before viewing; use RumahKu's in-app chat.

Respond ONLY with a JSON object of EXACTLY this shape (no markdown):
{"reply": "<your message to the renter>", "listingIds": [<up to 3 ids from the provided listings, best first>]}`;

function listingsBlock(listings: ConciergeListing[]): string {
  if (!listings.length) return "(no listings currently available)";
  return listings
    .map(
      (l) =>
        `- id=${l.id} | "${l.title}" | ${l.type} | ${l.area} | RM${l.price}/mo | ${l.distanceKm}km to UMS | ${l.scamLevel} | ${l.gender} | ${l.beds}BR`,
    )
    .join("\n");
}

/**
 * Grounded concierge reply via Gemini. Returns null when no API key / failure,
 * so the route can fall back to a deterministic suggestion.
 */
export async function conciergeReply(
  query: string,
  history: ConciergeTurn[],
  listings: ConciergeListing[],
): Promise<ConciergeResult | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const convo = history
      .slice(-6)
      .map((t) => `${t.role === "user" ? "Renter" : "You"}: ${t.content}`)
      .join("\n");

    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `Available listings:\n${listingsBlock(listings)}\n\n${
        convo ? `Conversation so far:\n${convo}\n\n` : ""
      }Renter's question: ${query}`,
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const text = res.text;
    if (!text) return null;
    const out = JSON.parse(text) as { reply?: string; listingIds?: unknown };
    const ids = Array.isArray(out.listingIds) ? out.listingIds.map(String).slice(0, 3) : [];
    const valid = new Set(listings.map((l) => l.id));
    return {
      reply: String(out.reply ?? "").trim() || "Here are a few options I found for you.",
      listingIds: ids.filter((id) => valid.has(id)),
    };
  } catch (err) {
    console.error("conciergeReply (gemini) failed:", err);
    return null;
  }
}
