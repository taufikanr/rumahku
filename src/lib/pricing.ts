import { AREA_BY_ID, type AreaId, type PropertyType } from "@/lib/constants";
import type { PriceFairness } from "@/lib/types";

/** Expected price of each property type relative to a single-room baseline. */
export const PROPERTY_TYPE_MULTIPLIER: Record<PropertyType, number> = {
  "room-shared": 0.65,
  room: 1.0,
  studio: 1.5,
  apartment: 2.3,
  house: 3.2,
};

/** Expected monthly rent for a property type in an area (RM). */
export function expectedPrice(areaId: AreaId, type: PropertyType): number {
  const base = AREA_BY_ID[areaId].avgRoomRent * PROPERTY_TYPE_MULTIPLIER[type];
  return Math.round(base / 10) * 10;
}

export function computePriceFairness(
  price: number,
  areaId: AreaId,
  type: PropertyType,
): PriceFairness {
  const areaAvg = expectedPrice(areaId, type);
  const deltaPct = Math.round(((price - areaAvg) / areaAvg) * 100);
  const verdict: PriceFairness["verdict"] =
    deltaPct <= -8 ? "below" : deltaPct >= 12 ? "above" : "fair";
  return { areaAvg, deltaPct, verdict };
}

export function priceVerdictLabel(f: PriceFairness): string {
  const abs = Math.abs(f.deltaPct);
  if (f.verdict === "below") return `${abs}% below area average — good deal`;
  if (f.verdict === "above") return `${abs}% above area average`;
  return "Around the fair market price";
}
