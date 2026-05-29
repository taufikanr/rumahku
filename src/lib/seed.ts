import { AREA_BY_ID, type AreaId, type PropertyType } from "@/lib/constants";
import type {
  FurnishLevel,
  GenderPreference,
  Housemate,
  LifestyleHabits,
  Profile,
  Review,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Reusable lifestyle presets                                          */
/* ------------------------------------------------------------------ */
const HABITS: Record<string, LifestyleHabits> = {
  studious: { sleep: "early", cleanliness: "very-tidy", social: "homebody", smoking: "non-smoker", noise: "quiet" },
  balanced: { sleep: "flexible", cleanliness: "tidy", social: "balanced", smoking: "non-smoker", noise: "moderate" },
  social: { sleep: "late", cleanliness: "relaxed", social: "social", smoking: "non-smoker", noise: "lively" },
  nightTidy: { sleep: "late", cleanliness: "tidy", social: "balanced", smoking: "non-smoker", noise: "moderate" },
  earlyRelaxed: { sleep: "early", cleanliness: "relaxed", social: "homebody", smoking: "non-smoker", noise: "quiet" },
};

/* ------------------------------------------------------------------ */
/* People                                                             */
/* ------------------------------------------------------------------ */
const DAY = 86_400_000;
// Fixed reference "now" so seed dates are deterministic (no Date.now at import).
const NOW = Date.parse("2026-05-29T00:00:00Z");
const daysAgo = (d: number) => new Date(NOW - d * DAY).toISOString();

export const LANDLORDS: Profile[] = [
  {
    id: "ll-kelvin",
    role: "landlord",
    fullName: "Kelvin Lim",
    email: "kelvin@biliksewasabah.my",
    phone: "+60 11-7038 0061",
    affiliation: "Bilik Sewa Sabah",
    bio: "Independent landlord managing rooms across Kota Kinabalu. Quick to respond on WhatsApp.",
    isVerified: true,
    rating: 4.8,
    reviewCount: 23,
    joinedAt: daysAgo(540),
  },
  {
    id: "ll-henry",
    role: "landlord",
    fullName: "Henry Wong",
    email: "henry@ktilandmark.my",
    phone: "+60 11-1020 0263",
    affiliation: "KTI Landmark Berhad",
    bio: "Property consultant helping students and young professionals find safe rentals in KK.",
    isVerified: true,
    rating: 4.6,
    reviewCount: 14,
    joinedAt: daysAgo(420),
  },
  {
    id: "ll-david",
    role: "landlord",
    fullName: "David Barumbon",
    email: "david@mybiliksabah.my",
    phone: "+60 10-925 0468",
    affiliation: "My Bilik Sabah",
    bio: "Agent listing verified rooms and apartments around Kota Kinabalu.",
    isVerified: true,
    rating: 4.5,
    reviewCount: 19,
    joinedAt: daysAgo(360),
  },
  {
    id: "ll-chin",
    role: "landlord",
    fullName: "Chin Hui Lin",
    email: "huilin@iqiroyalty.my",
    phone: "+60 16-729 8326",
    affiliation: "IQI Royalty",
    bio: "Experienced real-estate negotiator. Premium, well-maintained units with full documentation.",
    isVerified: true,
    rating: 4.9,
    reviewCount: 31,
    joinedAt: daysAgo(610),
  },
  {
    id: "ll-aaron",
    role: "landlord",
    fullName: "Aaron Tan",
    email: "aaron.rent@gmail.com",
    phone: "+60 12-388 1190",
    affiliation: "Private owner",
    bio: "New to the platform.",
    isVerified: false,
    rating: undefined,
    reviewCount: 0,
    joinedAt: daysAgo(6),
  },
  {
    id: "ll-unknown",
    role: "landlord",
    fullName: "Property Lister",
    email: "fastrent2026@gmail.com",
    phone: "+60 19-000 0000",
    affiliation: "Private owner",
    bio: "",
    isVerified: false,
    rating: undefined,
    reviewCount: 0,
    joinedAt: daysAgo(3),
  },
];

export const LANDLORD_BY_ID: Record<string, Profile> = Object.fromEntries(
  LANDLORDS.map((l) => [l.id, l]),
);

/** Demo tenant used for the logged-in experience + housemate matching. */
export const DEMO_TENANT: Profile = {
  id: "tenant-sara",
  role: "tenant",
  fullName: "Sara binti Ahmad",
  email: "sara@demo.rumahku.my",
  phone: "+60 13-555 0142",
  gender: "female",
  occupation: "UMS undergraduate",
  affiliation: "Universiti Malaysia Sabah",
  bio: "Final-year student looking for a safe, affordable room near campus with tidy housemates.",
  habits: HABITS.studious,
  isVerified: false,
  joinedAt: daysAgo(40),
};

/* ------------------------------------------------------------------ */
/* Housemate pool                                                     */
/* ------------------------------------------------------------------ */
const HM: Record<string, Housemate> = {
  aina: { name: "Aina", age: 22, gender: "female", occupation: "UMS student (Biology)", habits: HABITS.studious },
  mei: { name: "Mei Yee", age: 23, gender: "female", occupation: "UMS student (Accounting)", habits: HABITS.balanced },
  farah: { name: "Farah", age: 24, gender: "female", occupation: "Teacher trainee", habits: HABITS.earlyRelaxed },
  dini: { name: "Dini", age: 21, gender: "female", occupation: "UMS student (Nursing)", habits: HABITS.nightTidy },
  hafiz: { name: "Hafiz", age: 25, gender: "male", occupation: "Technician", habits: HABITS.balanced },
  jason: { name: "Jason", age: 24, gender: "male", occupation: "UMS student (Engineering)", habits: HABITS.social },
  ryan: { name: "Ryan", age: 26, gender: "male", occupation: "Sales executive", habits: HABITS.nightTidy },
  amir: { name: "Amir", age: 23, gender: "male", occupation: "UMS student (IT)", habits: HABITS.studious },
};

/* ------------------------------------------------------------------ */
/* Review pool                                                        */
/* ------------------------------------------------------------------ */
const REVIEW_SNIPPETS: { name: string; rating: number; comment: string }[] = [
  { name: "Nadia", rating: 5, comment: "Room exactly like the photos. Landlord verified my deposit return without any fuss." },
  { name: "Wei Jie", rating: 5, comment: "Super responsive on WhatsApp. Deposit fully returned when I moved out." },
  { name: "Sofea", rating: 4, comment: "Clean and safe area. Wifi could be faster but overall great value." },
  { name: "Khairul", rating: 5, comment: "Felt safe renting here — no scam, proper agreement provided." },
  { name: "Michelle", rating: 4, comment: "Good location, close to campus. Housemates were friendly and tidy." },
  { name: "Hasif", rating: 5, comment: "Transparent about everything. Move-in condition was documented properly." },
  { name: "Pris", rating: 4, comment: "Nice unit, fair price for the area. Parking was a small issue." },
  { name: "Daniel", rating: 5, comment: "Best rental experience in KK so far. Highly recommend this landlord." },
];

function reviewsFor(seed: number, n: number): Review[] {
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const s = REVIEW_SNIPPETS[(seed + i * 3) % REVIEW_SNIPPETS.length];
    out.push({
      id: `rv-${seed}-${i}`,
      authorName: s.name,
      authorRole: "tenant",
      rating: s.rating,
      comment: s.comment,
      createdAt: daysAgo(20 + i * 18 + (seed % 15)),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Raw listings                                                       */
/* ------------------------------------------------------------------ */
export interface RawListing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  areaId: AreaId;
  addressLine: string;
  lat: number;
  lng: number;
  price: number;
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
  status: "active" | "rented";
  listedVia?: string;
  createdAt: string;
}

const ALL_AMENITIES = [
  "WiFi",
  "Air-conditioning",
  "Water heater",
  "Washing machine",
  "Shared kitchen",
  "Parking",
  "Study desk",
  "Wardrobe",
  "24h security",
  "Convenience store nearby",
];

interface Spec {
  id: string;
  ll: string;
  area: AreaId;
  type: PropertyType;
  price: number;
  beds: number;
  baths: number;
  furnished: FurnishLevel;
  gender: GenderPreference;
  photos: number;
  size?: number;
  housemates?: (keyof typeof HM)[];
  reviews?: number;
  title: string;
  desc: string;
  via?: string;
  ageDays: number;
  amenities?: number;
  status?: "active" | "rented";
}

const SPECS: Spec[] = [
  // ---- Near UMS / Sepanggar / 1Borneo (student-focused, safe) ----
  { id: "l-001", ll: "ll-kelvin", area: "sepanggar", type: "room", price: 420, beds: 1, baths: 1, furnished: "full", gender: "female", photos: 5, housemates: ["aina", "mei"], reviews: 4, ageDays: 22, amenities: 8, title: "Cozy furnished room near UMS", desc: "Fully furnished single room 6 minutes from UMS main gate. Includes air-cond, study desk, wardrobe and fast WiFi. Female housemates only, very tidy. Viewing welcome anytime." },
  { id: "l-002", ll: "ll-david", area: "one-borneo", type: "room", price: 600, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 6, housemates: ["jason", "amir"], reviews: 3, ageDays: 30, amenities: 9, title: "Master room at 1Borneo condo", desc: "Spacious master room with private bathroom in a guarded condominium next to 1Borneo. Pool and gym access included. Walking distance to shops and bus to UMS." },
  { id: "l-003", ll: "ll-kelvin", area: "sepanggar", type: "room-shared", price: 280, beds: 1, baths: 1, furnished: "partial", gender: "male", photos: 4, housemates: ["hafiz"], reviews: 2, ageDays: 15, amenities: 6, title: "Affordable shared room for students", desc: "Budget shared room ideal for students. Walking distance to UMS. Basic furniture provided, shared kitchen and washing machine. Viewing available on weekends." },
  { id: "l-004", ll: "ll-henry", area: "kolombong", type: "studio", price: 800, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 6, reviews: 4, size: 420, ageDays: 40, amenities: 9, title: "Modern studio in Kolombong", desc: "Brand new fully furnished studio with kitchenette, perfect for a working professional or couple. Secure building with covered parking. Proper tenancy agreement provided." },
  { id: "l-005", ll: "ll-david", area: "inanam", type: "room", price: 480, beds: 1, baths: 1, furnished: "partial", gender: "any", photos: 4, housemates: ["ryan"], reviews: 2, ageDays: 18, amenities: 7, title: "Quiet room in Inanam", desc: "Comfortable room in a landed house, quiet neighbourhood with easy access to the highway. Suitable for working adults. Monthly utilities shared fairly." },

  // ---- City / Luyang / Likas (mid–premium) ----
  { id: "l-006", ll: "ll-chin", area: "luyang", type: "apartment", price: 1600, beds: 3, baths: 2, furnished: "full", gender: "any", photos: 6, reviews: 5, size: 1000, ageDays: 35, amenities: 10, title: "3-bedroom apartment in Luyang", desc: "Well-maintained 3-bedroom unit in central Luyang, close to hospitals and shopping. Fully furnished, ideal for a family or a group of professionals. Includes digital tenancy agreement and move-in inspection." },
  { id: "l-007", ll: "ll-chin", area: "city-centre", type: "studio", price: 980, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 5, reviews: 4, size: 480, ageDays: 28, amenities: 9, title: "City-centre studio with sea view", desc: "Premium studio in the heart of KK with partial sea view, walking distance to the waterfront. High-floor, secure, with full facilities. Perfect for professionals." },
  { id: "l-008", ll: "ll-henry", area: "likas", type: "room", price: 650, beds: 1, baths: 1, furnished: "full", gender: "female", photos: 5, housemates: ["farah", "dini"], reviews: 3, ageDays: 25, amenities: 8, title: "Bright room near Likas Sports Complex", desc: "Airy room in a well-kept apartment near Likas. Female unit, friendly housemates, jogging track nearby. WiFi and air-cond included." },
  { id: "l-009", ll: "ll-david", area: "luyang", type: "room", price: 560, beds: 1, baths: 1, furnished: "partial", gender: "any", photos: 4, housemates: ["mei"], reviews: 2, ageDays: 20, amenities: 7, title: "Middle room in Luyang condo", desc: "Affordable middle room in a condominium with pool and gym. Central location near Damai and city. Shared kitchen, washing machine, covered parking." },
  { id: "l-010", ll: "ll-chin", area: "damai", type: "apartment", price: 1450, beds: 2, baths: 2, furnished: "full", gender: "any", photos: 6, reviews: 4, size: 850, ageDays: 33, amenities: 10, title: "2-bed serviced apartment in Damai", desc: "Modern serviced apartment in Damai with full facilities, 24h security and infinity pool. Suitable for professionals or a small family. Documentation and inspection provided." },

  // ---- Sepanggar / Menggatal / suburbs (budget) ----
  { id: "l-011", ll: "ll-kelvin", area: "menggatal", type: "room", price: 380, beds: 1, baths: 1, furnished: "partial", gender: "any", photos: 4, housemates: ["hafiz", "ryan"], reviews: 2, ageDays: 16, amenities: 6, title: "Budget room in Menggatal", desc: "Simple, clean room in Menggatal town. Near market and public transport. Good for students commuting to UMS or workers. Affordable monthly rent." },
  { id: "l-012", ll: "ll-henry", area: "kingfisher", type: "room", price: 600, beds: 1, baths: 1, furnished: "full", gender: "female", photos: 5, housemates: ["aina", "farah"], reviews: 3, ageDays: 24, amenities: 8, title: "Furnished room at Kingfisher", desc: "Comfortable furnished room in the popular Kingfisher area, close to UMS and the highway. Female housemates, clean and quiet. Viewing welcome." },
  { id: "l-013", ll: "ll-david", area: "kingfisher", type: "apartment", price: 1300, beds: 3, baths: 2, furnished: "partial", gender: "any", photos: 5, reviews: 3, size: 950, ageDays: 29, amenities: 9, title: "Whole apartment at Kingfisher Park", desc: "Partially furnished 3-bedroom apartment, great for sharing among students or a family. Near UMS, shops and clinics. Reasonable rent for the size." },
  { id: "l-014", ll: "ll-kelvin", area: "kolombong", type: "room", price: 450, beds: 1, baths: 1, furnished: "partial", gender: "male", photos: 4, housemates: ["amir"], reviews: 2, ageDays: 19, amenities: 7, title: "Single room in Kolombong", desc: "Tidy single room in a shared apartment, male unit. Near eateries and convenience stores. Shared kitchen and laundry. Utilities split evenly." },
  { id: "l-015", ll: "ll-henry", area: "sepanggar", type: "studio", price: 720, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 6, reviews: 4, size: 400, ageDays: 27, amenities: 9, title: "Studio walking distance to UMS", desc: "Fully furnished studio just a short walk to UMS — ideal for postgrad students or lecturers. Secure, quiet, with parking. Tenancy agreement provided." },

  // ---- More variety ----
  { id: "l-016", ll: "ll-chin", area: "sembulan", type: "apartment", price: 1750, beds: 2, baths: 2, furnished: "full", gender: "any", photos: 6, reviews: 5, size: 900, ageDays: 31, amenities: 10, title: "Premium apartment in Api-Api", desc: "High-end fully furnished unit in the Sembulan / Api-Api commercial hub. Walking distance to offices, cafes and the waterfront. Full facilities and concierge." },
  { id: "l-017", ll: "ll-david", area: "penampang", type: "house", price: 1900, beds: 4, baths: 3, furnished: "partial", gender: "any", photos: 5, reviews: 3, size: 1800, ageDays: 38, amenities: 8, title: "Double-storey house in Penampang", desc: "Spacious double-storey terrace house in Penampang, great for a large family or group sharing. Gated neighbourhood, ample parking, near Donggongon town." },
  { id: "l-018", ll: "ll-kelvin", area: "putatan", type: "room", price: 400, beds: 1, baths: 1, furnished: "partial", gender: "any", photos: 4, housemates: ["ryan"], reviews: 2, ageDays: 14, amenities: 6, title: "Room in Putatan near amenities", desc: "Affordable room close to Putatan town, markets and public transport. Suitable for working adults. Clean shared facilities." },
  { id: "l-019", ll: "ll-henry", area: "city-centre", type: "room", price: 700, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 5, housemates: ["jason"], reviews: 3, ageDays: 23, amenities: 8, title: "Room in the heart of KK city", desc: "Furnished room right in the city centre, walking distance to offices, malls and the night market. Great for young professionals. WiFi and air-cond included." },
  { id: "l-020", ll: "ll-david", area: "likas", type: "apartment", price: 1500, beds: 3, baths: 2, furnished: "full", gender: "any", photos: 6, reviews: 4, size: 1050, ageDays: 26, amenities: 10, title: "Family apartment near Likas Bay", desc: "Fully furnished 3-bedroom apartment with sea breeze near Likas Bay. Pool, gym and 24h security. Ideal for families. Proper agreement and inspection included." },
  { id: "l-021", ll: "ll-kelvin", area: "inanam", type: "room-shared", price: 250, beds: 1, baths: 1, furnished: "partial", gender: "male", photos: 4, housemates: ["hafiz"], reviews: 2, ageDays: 12, amenities: 6, title: "Cheap shared room in Inanam", desc: "Very affordable shared room for students or workers on a tight budget. Basic but clean. Near bus routes to town and UMS." },
  { id: "l-022", ll: "ll-chin", area: "luyang", type: "studio", price: 1050, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 6, reviews: 5, size: 520, ageDays: 30, amenities: 10, title: "Designer studio in Luyang", desc: "Stylish, fully furnished studio in a modern Luyang development. Co-working lounge, gym, pool. Perfect for a professional who wants comfort and security." },

  // ---- Caution / scam examples (to demonstrate the detector) ----
  { id: "l-023", ll: "ll-aaron", area: "city-centre", type: "studio", price: 350, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 1, reviews: 0, ageDays: 6, status: "active", amenities: 5, via: "Facebook", title: "LUXURY studio city view CHEAP!!", desc: "Brand new luxury studio in city centre, very cheap! I am currently overseas so cannot do viewing. Please transfer dulu the deposit to secure the unit, very urgent many people want. Booking fee required." },
  { id: "l-024", ll: "ll-unknown", area: "luyang", type: "apartment", price: 600, beds: 3, baths: 2, furnished: "full", gender: "any", photos: 0, reviews: 0, ageDays: 3, status: "active", amenities: 4, via: "WhatsApp", title: "3 bedroom apartment super cheap urgent", desc: "Fully furnished 3 room apartment in Luyang only RM600! Owner moving out, must rent fast. No viewing needed, deposit before viewing to lock the unit. Bank in today." },
  { id: "l-025", ll: "ll-aaron", area: "kingfisher", type: "room", price: 300, beds: 1, baths: 1, furnished: "full", gender: "any", photos: 2, reviews: 0, ageDays: 6, status: "active", amenities: 5, via: "Mudah", title: "Nice room near UMS cheap rent", desc: "Furnished room near UMS, cheaper than market. Im working outstation so my agent will collect. Pay deposit first then I pass the key. Limited time offer." },
];

function expand(spec: Spec): RawListing {
  const area = AREA_BY_ID[spec.area];
  // Small deterministic per-listing offset so map points aren't identical.
  const seed = parseInt(spec.id.replace(/\D/g, ""), 10) || 1;
  const jitter = (n: number) => Number((((seed * n) % 17) - 8) / 1000);
  const photos = Array.from({ length: spec.photos }, (_, i) => `${spec.id}-${i + 1}`);
  const amenityCount = spec.amenities ?? 7;
  const amenities = ALL_AMENITIES.slice(0, amenityCount);
  return {
    id: spec.id,
    landlordId: spec.ll,
    title: spec.title,
    description: spec.desc,
    areaId: spec.area,
    addressLine: `${area.name}, Kota Kinabalu, Sabah`,
    lat: area.lat + jitter(3),
    lng: area.lng + jitter(7),
    price: spec.price,
    deposit: spec.price * 2,
    propertyType: spec.type,
    bedrooms: spec.beds,
    bathrooms: spec.baths,
    sizeSqft: spec.size,
    furnished: spec.furnished,
    genderPreference: spec.gender,
    photos,
    amenities,
    availableFrom: daysAgo(-(7 + (seed % 21))), // available in the near future
    currentHousemates: (spec.housemates ?? []).map((k) => HM[k]),
    reviews: reviewsFor(seed, spec.reviews ?? 0),
    status: spec.status ?? "active",
    listedVia: spec.via,
    createdAt: daysAgo(spec.ageDays),
  };
}

export const RAW_LISTINGS: RawListing[] = SPECS.map(expand);

/** Account age (days) per landlord, relative to the seed reference date. */
export function landlordAgeDays(landlordId: string): number {
  const ll = LANDLORD_BY_ID[landlordId];
  if (!ll) return 365;
  return Math.round((NOW - Date.parse(ll.joinedAt)) / DAY);
}
