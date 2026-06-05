import { AREA_BY_ID, LANDMARKS, type AreaId } from "@/lib/constants";
import { distanceKm, estDriveMins } from "@/lib/geo";

export interface Commute {
  km: number;
  mins: number;
}

export interface NeighbourhoodInsight {
  name: string;
  avgRoomRent: number;
  toUms: Commute;
  toCity: Commute;
  /** Short qualitative vibe tags (not factual hazard claims). */
  tags: string[];
  blurb: string;
}

/** Curated, qualitative area context for Kota Kinabalu neighbourhoods. */
const PROFILE: Record<AreaId, { tags: string[]; blurb: string }> = {
  sepanggar: {
    tags: ["Closest to UMS", "Student-dense", "Affordable"],
    blurb: "The go-to area for UMS students who want the shortest possible commute.",
  },
  "one-borneo": {
    tags: ["Beside 1Borneo mall", "Shops & food", "Student-friendly"],
    blurb: "Mall, cafes and groceries on your doorstep, a short hop from campus.",
  },
  kolombong: {
    tags: ["Residential", "Budget-friendly", "Local eateries"],
    blurb: "A practical, value-for-money area with plenty of local food nearby.",
  },
  inanam: {
    tags: ["Transport hub", "Local markets", "Value rents"],
    blurb: "Well-connected by road and bus, with fresh markets and affordable rooms.",
  },
  menggatal: {
    tags: ["Township feel", "Most affordable", "Local amenities"],
    blurb: "One of the most affordable areas, with a relaxed township atmosphere.",
  },
  kingfisher: {
    tags: ["Quiet residential", "Near QEH hospital", "Family-friendly"],
    blurb: "A calm residential pocket popular with families and healthcare workers.",
  },
  likas: {
    tags: ["Seaside & sports complex", "Central", "Popular with professionals"],
    blurb: "Bayfront living near the sports complex — central and well-liked by young workers.",
  },
  luyang: {
    tags: ["Established suburb", "Cafes & clinics", "Well-connected"],
    blurb: "A mature, convenient suburb with everyday amenities close by.",
  },
  "city-centre": {
    tags: ["Heart of KK", "Malls & nightlife", "Walkable"],
    blurb: "Right in the city — malls, offices and nightlife all within walking distance.",
  },
  sembulan: {
    tags: ["Waterfront (Api-Api)", "Dining & offices", "Central"],
    blurb: "Central waterfront area with dining and offices, popular with professionals.",
  },
  damai: {
    tags: ["Cafes & food", "Central", "Lively"],
    blurb: "A lively, central neighbourhood known for its cafe and food scene.",
  },
  penampang: {
    tags: ["Suburban", "Hypermarkets", "Spacious"],
    blurb: "Roomier suburban living with big hypermarkets and easy parking.",
  },
  putatan: {
    tags: ["Growing township", "Affordable", "Near airport"],
    blurb: "A fast-growing township, affordable and handy for the airport.",
  },
  donggongon: {
    tags: ["Penampang town", "Local markets", "Value rents"],
    blurb: "The heart of Penampang town — local markets and good-value rooms.",
  },
};

export function getNeighbourhoodInsight(areaId: AreaId): NeighbourhoodInsight {
  const area = AREA_BY_ID[areaId];
  const ref = { lat: area.lat, lng: area.lng };
  const umsKm = Math.round(distanceKm(ref, LANDMARKS.ums) * 10) / 10;
  const cityKm = Math.round(distanceKm(ref, LANDMARKS.cityCentre) * 10) / 10;
  const p = PROFILE[areaId];
  return {
    name: area.name,
    avgRoomRent: area.avgRoomRent,
    toUms: { km: umsKm, mins: estDriveMins(umsKm) },
    toCity: { km: cityKm, mins: estDriveMins(cityKm) },
    tags: p.tags,
    blurb: p.blurb,
  };
}
