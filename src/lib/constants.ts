/**
 * RumahKu shared constants — Kota Kinabalu geography + validated research figures.
 * Coordinates are approximate neighbourhood centroids, used for campus-distance filtering.
 */

export const BRAND = {
  name: "RumahKu",
  tagline: "Sabah's trusted rental app",
  whatsappNote: "Chats happen over WhatsApp — the way Sabah already rents.",
} as const;

/** Key landmarks renters filter around. */
export const LANDMARKS = {
  ums: { name: "UMS (Universiti Malaysia Sabah)", lat: 6.0367, lng: 116.1186 },
  cityCentre: { name: "KK City Centre", lat: 5.9804, lng: 116.0735 },
  oneBorneo: { name: "1Borneo Hypermall", lat: 6.0271, lng: 116.1222 },
} as const;

export type AreaId =
  | "sepanggar"
  | "one-borneo"
  | "kolombong"
  | "inanam"
  | "menggatal"
  | "kingfisher"
  | "likas"
  | "luyang"
  | "city-centre"
  | "sembulan"
  | "damai"
  | "penampang"
  | "putatan"
  | "donggongon";

export interface Area {
  id: AreaId;
  name: string;
  lat: number;
  lng: number;
  /** Typical monthly rent (RM) for a single room — baseline for the price-fairness engine. */
  avgRoomRent: number;
}

/** Kota Kinabalu rental neighbourhoods (avgRoomRent calibrated to local market + Group 10 data). */
export const AREAS: Area[] = [
  { id: "sepanggar", name: "Sepanggar", lat: 6.03, lng: 116.12, avgRoomRent: 480 },
  { id: "one-borneo", name: "1Borneo / Sulaman", lat: 6.027, lng: 116.122, avgRoomRent: 620 },
  { id: "kolombong", name: "Kolombong", lat: 5.995, lng: 116.118, avgRoomRent: 520 },
  { id: "inanam", name: "Inanam", lat: 6.01, lng: 116.13, avgRoomRent: 500 },
  { id: "menggatal", name: "Menggatal", lat: 6.04, lng: 116.14, avgRoomRent: 450 },
  { id: "kingfisher", name: "Kingfisher", lat: 5.969, lng: 116.103, avgRoomRent: 600 },
  { id: "likas", name: "Likas", lat: 5.99, lng: 116.095, avgRoomRent: 650 },
  { id: "luyang", name: "Luyang", lat: 5.954, lng: 116.085, avgRoomRent: 700 },
  { id: "city-centre", name: "City Centre", lat: 5.98, lng: 116.073, avgRoomRent: 750 },
  { id: "sembulan", name: "Sembulan / Api-Api", lat: 5.975, lng: 116.078, avgRoomRent: 780 },
  { id: "damai", name: "Damai", lat: 5.96, lng: 116.082, avgRoomRent: 720 },
  { id: "penampang", name: "Penampang", lat: 5.92, lng: 116.1, avgRoomRent: 550 },
  { id: "putatan", name: "Putatan", lat: 5.89, lng: 116.07, avgRoomRent: 500 },
  { id: "donggongon", name: "Donggongon", lat: 5.915, lng: 116.105, avgRoomRent: 470 },
];

export const AREA_BY_ID: Record<AreaId, Area> = Object.fromEntries(
  AREAS.map((a) => [a.id, a]),
) as Record<AreaId, Area>;

/** Headline validation figures from Group 10's Task 1 + Task 2 research (n=44 survey, n=15 interviews). */
export const RESEARCH = {
  surveyN: 44,
  interviewN: 15,
  scamAffectedPct: 68.2, // scammed or almost scammed
  interestedPct: 100, // expressed interest in using RumahKu
  willingToPayPct: 80,
  housemateProblemPct: 77.3,
  depositTooHighPct: 70.5,
  facebookSearchPct: 43.2,
} as const;

export const PROPERTY_TYPES = [
  { id: "room", label: "Single room" },
  { id: "room-shared", label: "Shared room" },
  { id: "studio", label: "Studio" },
  { id: "apartment", label: "Whole apartment" },
  { id: "house", label: "Whole house" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["id"];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.id, t.label]),
) as Record<PropertyType, string>;
