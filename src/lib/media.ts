/**
 * Shared demo media — keeps the MVP presentation-ready:
 *   • every listing renders real room photos (no blank / gradient cards), and
 *   • every room shows the SAME walkthrough video with a room-photo poster
 *     (so it's never a random or missing clip).
 *
 * To use a real room walkthrough: drop a clip at /public/walkthrough.mp4 and set
 * WALKTHROUGH_VIDEO = "/walkthrough.mp4" — every listing will use it automatically.
 */

/** Curated room-interior photos (Unsplash) — verified to load in production. */
export const ROOM_PHOTOS = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=70",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Real photo URLs for a listing: keep any already-uploaded http photos, otherwise
 * a deterministic 4-photo set from the curated pool (keyed off the id) — so no
 * listing is ever blank.
 */
export function displayPhotos(id: string, existing?: string[] | null): string[] {
  const real = (existing ?? []).filter((p) => typeof p === "string" && p.startsWith("http"));
  if (real.length) return real;
  const start = hashId(id) % ROOM_PHOTOS.length;
  return Array.from({ length: 4 }, (_, i) => ROOM_PHOTOS[(start + i) % ROOM_PHOTOS.length]);
}

/** One consistent walkthrough clip for every room, shown with a room poster. */
export const WALKTHROUGH_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";
export const WALKTHROUGH_POSTER = ROOM_PHOTOS[0];
