import { AREA_BY_ID } from "@/lib/constants";
import { distanceKm } from "@/lib/geo";
import type {
  CaptureProof,
  Listing,
  PhotoCheck,
  PropertyVerification,
  PropertyVerifyStatus,
  VerificationCheck,
} from "@/lib/types";

/* ================================================================== */
/* Verified Real — Proof-of-Property                                   */
/*                                                                     */
/* Every rental platform (and RumahKu's own scam detector) only        */
/* *guesses* at scams from the listing text and price. None of them    */
/* PROVE the room physically exists and that the person listing it     */
/* actually controls it — so a polished scammer with stolen photos     */
/* and a fair price defeats text-based detection. That gap is exactly  */
/* the #1 validated pain (68.2% scammed / almost-scammed).             */
/*                                                                     */
/* Verified Real closes it with proof, not probability:                */
/*   1. Photo authenticity — every photo is hashed and checked for     */
/*      reuse (another listing today; the open web in production).      */
/*   2. Live on-site capture — the landlord records a walkthrough in    */
/*      the app with an on-screen one-time code + GPS + timestamp, so   */
/*      a recycled or downloaded video can't pass.                      */
/*   3. A shareable authenticity certificate (works even off-platform). */
/*                                                                     */
/* The score is intentionally TRANSPARENT (every factor is surfaced) — */
/* same philosophy as the scam detector and the Trust Passport. This   */
/* module is pure + deterministic (DB-swap-ready): a production build   */
/* swaps the demo records for the `listing_verifications` table.        */
/* ================================================================== */

const DAY = 86_400_000;

/** Listings whose photos were copied from elsewhere (stolen / "ghost" listings). */
const STOLEN_PHOTOS: Record<string, { count: number; note: string }> = {
  "l-023": {
    count: 1,
    note: "Found on 3 pages outside RumahKu (incl. 2 Facebook Marketplace posts)",
  },
  "l-025": {
    count: 1,
    note: "Matches a photo first published on listing l-016, 32 days earlier",
  },
};

/** Legit listings from verified landlords that simply haven't been verified yet. */
const AWAITING = new Set(["l-007", "l-014", "l-021"]);

/** Deterministic 32-bit FNV-1a hash — our stand-in for a perceptual image hash. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const DEVICES = ["Android · Chrome", "iPhone · Safari", "Android · RumahKu app"] as const;

/** The one-time code the landlord had to show on-screen during capture. */
export function oneTimeCode(id: string): string {
  return String(hash32(`${id}:code`) % 10000).padStart(4, "0");
}

/**
 * A deterministic on-site capture proof for a verified listing.
 * (Demo stand-in for a real in-app capture upload; values are derived from
 * the listing so SSR and client render identical strings — no hydration drift.)
 */
function captureFor(listing: Listing): CaptureProof {
  const h = hash32(`${listing.id}:gps`);
  // Small deterministic offset (~5–20 m) so the capture sits "at" the unit.
  const dLat = ((h % 31) - 15) / 1e5;
  const dLng = (((h >> 5) % 31) - 15) / 1e5;
  const lat = Number((listing.lat + dLat).toFixed(5));
  const lng = Number((listing.lng + dLng).toFixed(5));
  const distanceM = Math.round(
    distanceKm({ lat, lng }, { lat: listing.lat, lng: listing.lng }) * 1000,
  );
  const capturedAt = new Date(Date.parse(listing.createdAt) + 2 * DAY).toISOString();
  return {
    code: oneTimeCode(listing.id),
    lat,
    lng,
    distanceM,
    capturedAt,
    device: DEVICES[h % DEVICES.length],
  };
}

/** Compute a listing's Proof-of-Property verification (pure, deterministic). */
export function getListingVerification(listing: Listing): PropertyVerification {
  const certificateId = `RK-VR-${listing.id.toUpperCase()}`;
  const photos = listing.photos ?? [];
  const stolen = STOLEN_PHOTOS[listing.id];

  /* ---- photo authenticity ---- */
  const photoChecks: PhotoCheck[] = photos.map((p, i) => {
    const copied = stolen ? i < stolen.count : false;
    return {
      photoId: p,
      original: !copied,
      matchNote: copied && stolen ? stolen.note : undefined,
    };
  });
  const allOriginal = photos.length > 0 && photoChecks.every((c) => c.original);

  /* ---- status ---- */
  let status: PropertyVerifyStatus;
  let flagReason: string | undefined;
  if (stolen) {
    status = "flagged";
    flagReason =
      "One or more photos appear to be copied from elsewhere — a classic sign of a fake (ghost) listing.";
  } else if (photos.length === 0) {
    status = "unverified";
  } else if (AWAITING.has(listing.id) || !listing.isVerified || photos.length < 3) {
    status = "unverified";
  } else {
    status = "verified";
  }

  const capture = status === "verified" ? captureFor(listing) : undefined;
  const gpsMatch = capture ? capture.distanceM <= 80 : false;
  const areaName = AREA_BY_ID[listing.areaId]?.name ?? "the area";

  /* ---- transparent checks ---- */
  const checks: VerificationCheck[] = [
    {
      key: "photos",
      label: "Photos are original (not found elsewhere)",
      pass: allOriginal,
      detail: allOriginal
        ? `${photos.length} photo${photos.length === 1 ? "" : "s"} checked — none matched another listing`
        : stolen
          ? stolen.note
          : "No photos provided to check",
    },
    {
      key: "capture",
      label: "Live walkthrough captured on-site",
      pass: Boolean(capture),
      detail: capture
        ? `Recorded in-app with a one-time code (${capture.code})`
        : "Landlord hasn't done a live on-site capture yet",
    },
    {
      key: "gps",
      label: "GPS matches the advertised location",
      pass: gpsMatch,
      detail: capture
        ? `Captured ${capture.distanceM} m from the listed pin in ${areaName}`
        : "Needs an on-site capture to confirm",
    },
    {
      key: "landlord",
      label: "Landlord identity verified",
      pass: listing.isVerified,
      detail: listing.isVerified
        ? "KYC completed"
        : "Landlord hasn't completed identity verification",
    },
  ];

  /* ---- transparent authenticity score (0–100) ---- */
  let authenticity = 0;
  if (allOriginal) authenticity += 25;
  if (capture) authenticity += 35;
  if (gpsMatch) authenticity += 20;
  if (listing.isVerified) authenticity += 12;
  if (photos.length >= 5) authenticity += 8;
  authenticity = Math.max(0, Math.min(100, authenticity));

  return {
    status,
    authenticity,
    certificateId,
    checks,
    photoChecks,
    capture,
    verifiedAt: capture?.capturedAt,
    flagReason,
  };
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */
export const VERIFY_LABEL: Record<PropertyVerifyStatus, string> = {
  verified: "Verified Real",
  unverified: "Not yet verified",
  flagged: "Authenticity warning",
};
