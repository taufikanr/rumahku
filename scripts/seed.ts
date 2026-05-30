/**
 * Seeds the Supabase database with demo accounts, landlord profiles,
 * Kota Kinabalu listings and reviews. Reuses the in-app seed data.
 *
 * Run:  npm run seed   (after running supabase/schema.sql in the SQL editor)
 */
import { createClient } from "@supabase/supabase-js";
import { LANDLORD_BY_ID, DEMO_TENANT, RAW_LISTINGS } from "@/lib/seed";
import type { Profile } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO = {
  tenant: { email: "tenant@demo.rumahku.my", password: "rumahku123" },
  landlord: { email: "landlord@demo.rumahku.my", password: "rumahku123" },
};

// Stable UUIDs for the non-auth seed landlords.
const FIXED: Record<string, string> = {
  "ll-henry": "11111111-1111-4111-8111-111111111111",
  "ll-david": "22222222-2222-4222-8222-222222222222",
  "ll-chin": "33333333-3333-4333-8333-333333333333",
  "ll-aaron": "44444444-4444-4444-8444-444444444444",
  "ll-unknown": "55555555-5555-4555-8555-555555555555",
};

async function ensureUser(
  email: string,
  password: string,
  metadata: Record<string, string | undefined>,
): Promise<string> {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (!error && data.user) return data.user.id;

  // Already exists — find it.
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = list.users.find((u) => u.email === email);
  if (!found) throw error ?? new Error(`Could not create or find user ${email}`);
  // Make sure password + metadata are up to date.
  await db.auth.admin.updateUserById(found.id, { password, user_metadata: metadata });
  return found.id;
}

function profileRow(id: string, p: Profile) {
  return {
    id,
    role: p.role,
    full_name: p.fullName,
    email: p.email,
    phone: p.phone,
    gender: p.gender ?? null,
    occupation: p.occupation ?? null,
    affiliation: p.affiliation ?? null,
    bio: p.bio ?? null,
    is_verified: p.isVerified,
    rating: p.rating ?? null,
    review_count: p.reviewCount ?? 0,
    habits: p.habits ?? null,
  };
}

async function main() {
  console.log("→ Creating demo accounts…");
  const kelvin = LANDLORD_BY_ID["ll-kelvin"];
  const landlordId = await ensureUser(DEMO.landlord.email, DEMO.landlord.password, {
    full_name: kelvin.fullName,
    role: "landlord",
    phone: kelvin.phone,
  });
  const tenantId = await ensureUser(DEMO.tenant.email, DEMO.tenant.password, {
    full_name: DEMO_TENANT.fullName,
    role: "tenant",
    phone: DEMO_TENANT.phone,
  });

  const llUuid: Record<string, string> = { "ll-kelvin": landlordId, ...FIXED };

  console.log("→ Upserting profiles…");
  const profiles = [
    profileRow(landlordId, kelvin),
    profileRow(tenantId, DEMO_TENANT),
    ...Object.entries(FIXED).map(([sid, uuid]) => profileRow(uuid, LANDLORD_BY_ID[sid])),
  ];
  {
    const { error } = await db.from("profiles").upsert(profiles, { onConflict: "id" });
    if (error) throw new Error(`profiles: ${error.message}`);
  }

  console.log(`→ Upserting ${RAW_LISTINGS.length} listings…`);
  const listingRows = RAW_LISTINGS.map((r) => ({
    id: r.id,
    landlord_id: llUuid[r.landlordId],
    title: r.title,
    description: r.description,
    area_id: r.areaId,
    address_line: r.addressLine,
    lat: r.lat,
    lng: r.lng,
    price: r.price,
    deposit: r.deposit,
    property_type: r.propertyType,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    size_sqft: r.sizeSqft ?? null,
    furnished: r.furnished,
    gender_preference: r.genderPreference,
    photos: r.photos,
    amenities: r.amenities,
    available_from: r.availableFrom.slice(0, 10),
    current_housemates: r.currentHousemates,
    status: r.status,
    listed_via: r.listedVia ?? null,
    created_at: r.createdAt,
  }));
  {
    const { error } = await db.from("listings").upsert(listingRows, { onConflict: "id" });
    if (error) throw new Error(`listings: ${error.message}`);
  }

  console.log("→ Replacing reviews…");
  await db.from("reviews").delete().not("id", "is", null);
  const reviewRows = RAW_LISTINGS.flatMap((r) =>
    r.reviews.map((rv) => ({
      listing_id: r.id,
      author_name: rv.authorName,
      rating: rv.rating,
      comment: rv.comment,
      created_at: rv.createdAt,
    })),
  );
  {
    const { error } = await db.from("reviews").insert(reviewRows);
    if (error) throw new Error(`reviews: ${error.message}`);
  }

  console.log("→ Seeding demo bills for the tenant…");
  await db.from("bills").delete().eq("tenant_id", tenantId);
  const billRows = [
    { tenant_id: tenantId, label: "June rent", type: "rent", amount: 420, due_date: "2026-06-01", status: "due" },
    { tenant_id: tenantId, label: "Electricity (SESB)", type: "electricity", amount: 85, due_date: "2026-05-25", status: "due" },
    { tenant_id: tenantId, label: "Unifi internet", type: "internet", amount: 99, due_date: "2026-06-05", status: "due" },
    { tenant_id: tenantId, label: "Water bill", type: "water", amount: 28, due_date: "2026-05-18", status: "paid" },
  ];
  {
    const { error } = await db.from("bills").insert(billRows);
    if (error) throw new Error(`bills: ${error.message}`);
  }

  console.log("→ Seeding demo applications (tenant → landlord)…");
  await db.from("applications").delete().eq("tenant_id", tenantId);
  const appRows = [
    { listing_id: "l-003", tenant_id: tenantId, tenant_name: DEMO_TENANT.fullName, message: "Hi! I'm a final-year UMS student, very tidy and quiet. Is this room still available for next semester?", status: "pending" },
    { listing_id: "l-014", tenant_id: tenantId, tenant_name: DEMO_TENANT.fullName, message: "Interested in viewing this room this weekend — is that possible?", status: "pending" },
  ];
  {
    const { error } = await db.from("applications").insert(appRows);
    if (error) throw new Error(`applications: ${error.message}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Profiles: ${profiles.length}  Listings: ${listingRows.length}  Reviews: ${reviewRows.length}  Bills: ${billRows.length}  Applications: ${appRows.length}`);
  console.log("\n   Demo logins (password: rumahku123):");
  console.log(`   • Tenant  — ${DEMO.tenant.email}`);
  console.log(`   • Landlord — ${DEMO.landlord.email}`);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
