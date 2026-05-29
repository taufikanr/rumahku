import { createClient } from "@supabase/supabase-js";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { data: auth, error: e1 } = await s.auth.signInWithPassword({
  email: "landlord@demo.rumahku.my",
  password: "rumahku123",
});
if (e1) {
  console.log("login error:", e1.message);
  process.exit(1);
}
const uid = auth.user.id;

const { data: before } = await s.from("listings").select("id").eq("landlord_id", uid);
console.log("listings owned before:", before.length);

const id = crypto.randomUUID();
const { error: e2 } = await s.from("listings").insert({
  id, landlord_id: uid, title: "TEST listing", description: "test description near UMS",
  area_id: "sepanggar", address_line: "Sepanggar", lat: 6.03, lng: 116.12, price: 500,
  deposit: 1000, property_type: "room", bedrooms: 1, bathrooms: 1, furnished: "full",
  gender_preference: "any", photos: [`${id}-1`], amenities: ["WiFi"],
  available_from: "2026-06-15", current_housemates: [], status: "active",
});
console.log("insert own listing:", e2 ? "ERROR " + e2.message : "OK ✓");

const { error: e3 } = await s.from("listings").insert({
  id: crypto.randomUUID(), landlord_id: "11111111-1111-4111-8111-111111111111",
  title: "hack", description: "x", area_id: "luyang", price: 100, deposit: 200,
  property_type: "room", bedrooms: 1, bathrooms: 1, furnished: "full",
  gender_preference: "any", photos: [], amenities: [], available_from: "2026-06-15",
  current_housemates: [], status: "active",
});
console.log("insert as OTHER landlord:", e3 ? "BLOCKED by RLS ✓" : "NOT BLOCKED ✗ (bad!)");

const { error: e4 } = await s.from("listings").delete().eq("id", id);
console.log("delete own listing:", e4 ? "ERROR " + e4.message : "OK ✓");

const { data: after } = await s.from("listings").select("id").eq("landlord_id", uid);
console.log("listings owned after cleanup:", after.length);
await s.auth.signOut();
