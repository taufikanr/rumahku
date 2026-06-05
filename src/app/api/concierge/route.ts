import { NextRequest, NextResponse } from "next/server";
import { AREA_BY_ID, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { getListings } from "@/lib/data";
import {
  conciergeReply,
  type ConciergeListing,
  type ConciergeTurn,
} from "@/lib/ai-concierge";

export interface ConciergeCard {
  id: string;
  title: string;
  area: string;
  price: number;
  distanceKm: number;
  scamLevel: "safe" | "caution" | "high";
}

export async function POST(req: NextRequest) {
  let body: { query?: string; history?: ConciergeTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const query = String(body.query ?? "").trim().slice(0, 500);
  if (!query) return NextResponse.json({ error: "empty query" }, { status: 400 });
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  const all = await getListings({ filters: { sort: "recommended" } });
  const forModel: ConciergeListing[] = all.slice(0, 30).map((l) => ({
    id: l.id,
    title: l.title,
    area: AREA_BY_ID[l.areaId].name,
    type: PROPERTY_TYPE_LABEL[l.propertyType],
    price: l.price,
    distanceKm: l.distanceKm,
    scamLevel: l.scam.level,
    gender: l.genderPreference,
    beds: l.bedrooms,
  }));

  const card = (id: string): ConciergeCard | null => {
    const l = all.find((x) => x.id === id);
    return l
      ? {
          id: l.id,
          title: l.title,
          area: AREA_BY_ID[l.areaId].name,
          price: l.price,
          distanceKm: l.distanceKm,
          scamLevel: l.scam.level,
        }
      : null;
  };

  const ai = await conciergeReply(query, history, forModel);

  if (ai) {
    return NextResponse.json({
      reply: ai.reply,
      listings: ai.listingIds.map(card).filter(Boolean),
      aiUsed: true,
    });
  }

  // Deterministic fallback: the safest, cheapest, closest options.
  const picks = [...all]
    .filter((l) => l.scam.level !== "high")
    .sort((a, b) => a.price - b.price || a.distanceKm - b.distanceKm)
    .slice(0, 3);
  return NextResponse.json({
    reply:
      "Here are some scam-safe, budget-friendly rooms near UMS to start with. Tell me your budget, preferred area, or room type and I'll narrow it down. Remember: never pay a deposit before viewing.",
    listings: picks.map((l) => card(l.id)).filter(Boolean),
    aiUsed: false,
  });
}
