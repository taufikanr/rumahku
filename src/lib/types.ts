import type { AreaId, PropertyType } from "@/lib/constants";

export type Role = "tenant" | "landlord";

/** Structured lifestyle habits — drives housemate compatibility scoring. */
export interface LifestyleHabits {
  sleep: "early" | "late" | "flexible";
  cleanliness: "relaxed" | "tidy" | "very-tidy";
  social: "homebody" | "balanced" | "social";
  smoking: "non-smoker" | "smoker";
  noise: "quiet" | "moderate" | "lively";
}

export type GenderPreference = "any" | "male" | "female";

/** A person currently renting a unit — shown to prospective housemates. */
export interface Housemate {
  name: string;
  age?: number;
  gender: "male" | "female";
  occupation: string;
  habits: LifestyleHabits;
}

export interface Profile {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  /** WhatsApp number in international format, e.g. +60 12-345 6789 */
  phone: string;
  avatarUrl?: string;
  gender?: "male" | "female";
  occupation?: string;
  /** Course (students) or workplace (workers). */
  affiliation?: string;
  bio?: string;
  habits?: LifestyleHabits;
  /** Landlord KYC verification. */
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  joinedAt: string;
}

export type ScamLevel = "safe" | "caution" | "high";

export interface ScamRisk {
  /** 0 (safe) – 100 (high risk). */
  score: number;
  level: ScamLevel;
  /** Human-readable signals behind the score. */
  reasons: string[];
  /** Positive signals that lowered the risk. */
  positives: string[];
  /** True when an LLM produced/explained the assessment (vs rule-based fallback). */
  aiUsed: boolean;
  /** One-line AI/rule summary shown to the user. */
  summary: string;
}

export type PriceVerdict = "below" | "fair" | "above";

export interface PriceFairness {
  areaAvg: number;
  /** Percent difference vs area average (negative = cheaper). */
  deltaPct: number;
  verdict: PriceVerdict;
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: "tenant";
  rating: number;
  comment: string;
  createdAt: string;
}

export type FurnishLevel = "unfurnished" | "partial" | "full";

export interface Listing {
  id: string;
  landlordId: string;
  landlord: Pick<
    Profile,
    "id" | "fullName" | "avatarUrl" | "isVerified" | "rating" | "reviewCount" | "phone" | "joinedAt"
  >;
  title: string;
  description: string;
  areaId: AreaId;
  addressLine: string;
  lat: number;
  lng: number;
  /** Monthly rent in RM. */
  price: number;
  /** Deposit in RM (typically 2 months). */
  deposit: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sizeSqft?: number;
  furnished: FurnishLevel;
  genderPreference: GenderPreference;
  photos: string[];
  amenities: string[];
  availableFrom: string;
  currentHousemates: Housemate[];
  reviews: Review[];
  rating?: number;
  /** Inherits landlord KYC status. */
  isVerified: boolean;
  scam: ScamRisk;
  status: "active" | "rented";
  /** Where the landlord previously advertised (for "switched from" context). */
  listedVia?: string;
  createdAt: string;
}

/** Listing enriched with values computed for the viewing context. */
export interface EnrichedListing extends Listing {
  distanceKm: number;
  driveMins: number;
  price_fairness: PriceFairness;
  /** 0–100 compatibility with the current user's habits, when available. */
  housemateMatch?: number;
}

export type BillType = "rent" | "electricity" | "water" | "internet" | "other";
export type BillStatus = "paid" | "due" | "overdue";

export interface Bill {
  id: string;
  listingId?: string;
  label: string;
  type: BillType;
  amount: number;
  dueDate: string;
  status: BillStatus;
}

export interface Application {
  id: string;
  listingId: string;
  tenantId: string;
  tenantName: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}
