import { NextRequest, NextResponse } from "next/server";
import { AREA_BY_ID } from "@/lib/constants";
import { getListingById } from "@/lib/data";
import { aiScamCheck } from "@/lib/ai-scam";
import type { ScamRisk } from "@/lib/types";

// Per-instance cache so repeat views of the same listing don't re-call the model.
const cache = new Map<string, ScamRisk>();

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const cached = cache.get(id);
  if (cached) return NextResponse.json(cached);

  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ai = await aiScamCheck({
    title: listing.title,
    description: listing.description,
    areaName: AREA_BY_ID[listing.areaId].name,
    propertyType: listing.propertyType,
    price: listing.price,
    expectedPrice: listing.price_fairness.areaAvg,
    isVerifiedLandlord: listing.isVerified,
    photoCount: listing.photos.length,
    depositMonths: listing.price > 0 ? listing.deposit / listing.price : 2,
  });

  const result = ai ?? listing.scam; // fall back to the rule-based score
  if (ai) cache.set(id, result);
  return NextResponse.json(result);
}
