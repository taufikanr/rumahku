/**
 * Seeds DEMO CONTENT for every flow so the app is presentation-ready:
 * real listing photos + a walkthrough video, an in-app conversation,
 * two SafeDeposits (active + return-proposed), saved searches, and viewings.
 *
 * Run:  npm run seed        (first — base accounts/listings)
 *       npm run seed:demo   (then — this script)
 *
 * Sections that need migrations 0002–0004 are skipped gracefully (with a note)
 * if those tables don't exist yet — re-run after applying the SQL.
 */
import { createClient } from "@supabase/supabase-js";
import { DEMO_TENANT, LANDLORD_BY_ID } from "@/lib/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TENANT_EMAIL = "tenant@demo.rumahku.my";
const LANDLORD_EMAIL = "landlord@demo.rumahku.my";
const TENANT_NAME = DEMO_TENANT.fullName;
const LANDLORD_NAME = LANDLORD_BY_ID["ll-kelvin"].fullName;

// Verified-loading stock imagery (room interiors) + a sample walkthrough clip.
const IMG = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=70",
];
const VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const at = (mins: number) => new Date(Date.now() + mins * 60_000).toISOString();
const days = (d: number) => at(d * 24 * 60);

async function findUserId(email: string): Promise<string | null> {
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data.users.find((u) => u.email === email)?.id ?? null;
}

function check(error: { message: string } | null, label: string) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function section(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`• skipped ${name} — ${msg}\n  (apply the matching migration, then re-run)`);
  }
}

async function main() {
  const tenantId = await findUserId(TENANT_EMAIL);
  const landlordId = await findUserId(LANDLORD_EMAIL);
  if (!tenantId || !landlordId) {
    console.error("Demo accounts not found. Run `npm run seed` first.");
    process.exit(1);
  }
  console.log("→ Seeding demo content for all flows…\n");

  // 1) Real photos (listings table always exists)
  await section("listing photos", async () => {
    check(
      (await db.from("listings").update({ photos: [IMG[0], IMG[1], IMG[2], IMG[3]] }).eq("id", "l-001")).error,
      "l-001 photos",
    );
    check((await db.from("listings").update({ photos: [IMG[2], IMG[4]] }).eq("id", "l-003")).error, "l-003 photos");
    check((await db.from("listings").update({ photos: [IMG[3], IMG[5], IMG[1]] }).eq("id", "l-014")).error, "l-014 photos");
    check((await db.from("listings").update({ photos: [IMG[4], IMG[0], IMG[5]] }).eq("id", "l-006")).error, "l-006 photos");
  });

  // 2) Verified walkthrough video (needs migration 0004: walkthrough_url column)
  await section("walkthrough video (0004)", async () => {
    check((await db.from("listings").update({ walkthrough_url: VIDEO }).eq("id", "l-001")).error, "walkthrough");
  });

  // 3) In-app conversation (needs 0002)
  await section("messaging (0002)", async () => {
    check((await db.from("conversations").delete().eq("tenant_id", tenantId)).error, "clear convos");
    const conv = await db
      .from("conversations")
      .insert({
        listing_id: "l-001",
        listing_title: "Cozy furnished room near UMS",
        tenant_id: tenantId,
        landlord_id: landlordId,
        last_message_at: days(-1),
      })
      .select("id")
      .single();
    check(conv.error, "insert conversation");
    const cid = (conv.data as { id: string }).id;
    const msgs = [
      { conversation_id: cid, sender_id: tenantId, body: "Hi Kelvin! Is the room near UMS still available for next semester?", created_at: days(-3), read_at: days(-3) },
      { conversation_id: cid, sender_id: landlordId, body: "Hi Sara! Yes, it's available from July. Would you like to arrange a viewing?", created_at: at(-3 * 1440 + 60), read_at: days(-2) },
      { conversation_id: cid, sender_id: tenantId, body: "Yes please 🙂 Is this Saturday afternoon okay? And what's the deposit?", created_at: days(-2), read_at: days(-2) },
      { conversation_id: cid, sender_id: landlordId, body: "Saturday 2pm works. Deposit is 2 months and I provide a proper tenancy agreement — all done in-app via RumahKu.", created_at: days(-1), read_at: null },
    ];
    check((await db.from("messages").insert(msgs)).error, "insert messages");
  });

  // 4) SafeDeposits (needs 0003)
  await section("SafeDeposit (0003)", async () => {
    check((await db.from("deposits").delete().eq("tenant_id", tenantId)).error, "clear deposits");

    // (a) Active deposit with move-in evidence
    const d1 = await db
      .from("deposits")
      .insert({ listing_id: "l-014", listing_title: "Single room in Kolombong", tenant_id: tenantId, landlord_id: landlordId, amount: 900, status: "active", updated_at: days(-10) })
      .select("id")
      .single();
    check(d1.error, "deposit A");
    const a = (d1.data as { id: string }).id;
    check(
      (await db.from("deposit_events").insert([
        { deposit_id: a, author_id: landlordId, author_name: LANDLORD_NAME, type: "created", note: `Deposit protection opened for ${TENANT_NAME}.`, created_at: days(-30) },
        { deposit_id: a, author_id: tenantId, author_name: TENANT_NAME, type: "movein_evidence", note: "Move-in condition — everything clean and in order.", photos: [IMG[3], IMG[5]], created_at: days(-29) },
        { deposit_id: a, author_id: landlordId, author_name: LANDLORD_NAME, type: "note", note: "Confirmed, thanks Sara. Welcome in!", created_at: days(-29) },
      ])).error,
      "events A",
    );

    // (b) Return proposed — tenant can accept or dispute
    const d2 = await db
      .from("deposits")
      .insert({ listing_id: "l-003", listing_title: "Affordable shared room for students", tenant_id: tenantId, landlord_id: landlordId, amount: 560, proposed_return: 510, status: "return_proposed", updated_at: days(-1) })
      .select("id")
      .single();
    check(d2.error, "deposit B");
    const bId = (d2.data as { id: string }).id;
    check(
      (await db.from("deposit_events").insert([
        { deposit_id: bId, author_id: landlordId, author_name: LANDLORD_NAME, type: "created", note: "Deposit protection opened.", created_at: days(-200) },
        { deposit_id: bId, author_id: tenantId, author_name: TENANT_NAME, type: "movein_evidence", note: "Move-in photos.", photos: [IMG[2]], created_at: days(-199) },
        { deposit_id: bId, author_id: tenantId, author_name: TENANT_NAME, type: "moveout_evidence", note: "Move-out — cleaned the room, returned the keys.", photos: [IMG[4]], created_at: days(-2) },
        { deposit_id: bId, author_id: landlordId, author_name: LANDLORD_NAME, type: "return_proposed", amount: 510, note: "Returning RM510. RM50 deducted for professional cleaning (receipt attached).", created_at: days(-1) },
      ])).error,
      "events B",
    );
  });

  // 5) Saved searches (needs 0004)
  await section("saved searches (0004)", async () => {
    check((await db.from("saved_searches").delete().eq("user_id", tenantId)).error, "clear searches");
    check(
      (await db.from("saved_searches").insert([
        { user_id: tenantId, label: "Rooms in Sepanggar under RM500", query: { area: "sepanggar", maxPrice: 500, safeOnly: true, sort: "recommended" }, notify: true, created_at: days(-7) },
        { user_id: tenantId, label: "Female-only rooms near UMS", query: { gender: "female", maxDistanceKm: 5, safeOnly: true }, notify: true, created_at: days(-2) },
      ])).error,
      "insert searches",
    );
  });

  // 6) Viewings (needs 0004)
  await section("viewings (0004)", async () => {
    check((await db.from("viewings").delete().eq("tenant_id", tenantId)).error, "clear viewings");
    check(
      (await db.from("viewings").insert([
        { listing_id: "l-003", listing_title: "Affordable shared room for students", tenant_id: tenantId, landlord_id: landlordId, preferred_at: days(3), note: "Hi! Could I view this on the weekend? I'm free in the afternoon.", status: "pending", created_at: days(-1) },
        { listing_id: "l-001", listing_title: "Cozy furnished room near UMS", tenant_id: tenantId, landlord_id: landlordId, preferred_at: days(5), note: "Looking forward to seeing the room, thank you!", status: "confirmed", created_at: days(-2) },
      ])).error,
      "insert viewings",
    );
  });

  // 7) Real Trust Passport data — payments / tenancies / tenant reviews (needs 0005)
  await section("Trust Passport data (0005)", async () => {
    check((await db.from("payments").delete().eq("tenant_id", tenantId)).error, "clear payments");
    check((await db.from("tenancies").delete().eq("tenant_id", tenantId)).error, "clear tenancies");
    check((await db.from("tenant_reviews").delete().eq("tenant_id", tenantId)).error, "clear tenant_reviews");

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const RENT = 450;
    const payRows = Array.from({ length: 18 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        tenant_id: tenantId,
        listing_id: "l-001",
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()} rent`,
        amount: RENT,
        paid_on: d.toISOString().slice(0, 10),
        on_time: true,
      };
    });
    check((await db.from("payments").insert(payRows)).error, "insert payments");

    check(
      (await db.from("tenancies").insert([
        { tenant_id: tenantId, property: "Single room · University Apartment, Sepanggar", area: "Sepanggar (near UMS)", landlord_name: LANDLORD_NAME, landlord_verified: true, start_label: "Jan 2025", end_label: null, months: 18, on_time_rate: 100 },
        { tenant_id: tenantId, property: "Shared apartment · Likas", area: "Likas", landlord_name: "Henry Wong", landlord_verified: true, start_label: "Jan 2024", end_label: "Dec 2024", months: 12, on_time_rate: 100 },
      ])).error,
      "insert tenancies",
    );

    check(
      (await db.from("tenant_reviews").insert([
        { tenant_id: tenantId, landlord_id: landlordId, landlord_name: LANDLORD_NAME, landlord_verified: true, rating: 5, comment: "Paid rent on time every single month and kept the room spotless. The kind of tenant every landlord wants — happy to be a reference.", created_at: days(-30) },
        { tenant_id: tenantId, landlord_id: null, landlord_name: "Henry Wong", landlord_verified: true, rating: 5, comment: "Reliable and respectful, no payment issues at all over a full year. Returned the unit in great condition.", created_at: days(-200) },
      ])).error,
      "insert tenant_reviews",
    );
  });

  console.log("\n✅ Demo seed complete. Log in as the demo tenant/landlord to see every flow populated.");
}

main().catch((e) => {
  console.error("❌ Demo seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
