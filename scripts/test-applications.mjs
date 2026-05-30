import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Tenant applies to listing l-001 (owned by the demo landlord)
const t = createClient(url, anon);
await t.auth.signInWithPassword({ email: "tenant@demo.rumahku.my", password: "rumahku123" });
const { data: { user: tenant } } = await t.auth.getUser();
const { data: ins, error: ie } = await t
  .from("applications")
  .insert({
    listing_id: "l-001",
    tenant_id: tenant.id,
    tenant_name: "Sara binti Ahmad",
    message: "TEST — Hi! I'm a tidy UMS student, keen to view this room.",
    status: "pending",
  })
  .select()
  .single();
console.log("tenant inserts application:", ie ? "❌ " + ie.message : "✅ OK");
await t.auth.signOut();

// 2. Landlord reads applications (RLS should scope to their listings)
const l = createClient(url, anon);
await l.auth.signInWithPassword({ email: "landlord@demo.rumahku.my", password: "rumahku123" });
const { data: apps, error: re } = await l
  .from("applications")
  .select("*, listing:listings!applications_listing_id_fkey(title)")
  .order("created_at", { ascending: false });
console.log("landlord reads applications:", re ? "❌ " + re.message : `✅ ${apps.length} found`);
for (const a of (apps ?? []).slice(0, 3)) {
  console.log(`   • ${a.tenant_name} → ${a.listing?.title} [${a.status}]`);
}

// 3. Landlord accepts it
if (ins) {
  const { error: ue } = await l.from("applications").update({ status: "accepted" }).eq("id", ins.id);
  console.log("landlord accepts:", ue ? "❌ " + ue.message : "✅ OK");
}
await l.auth.signOut();

// 4. Cleanup with service role
if (ins) {
  const svc = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  await svc.from("applications").delete().eq("id", ins.id);
  console.log("cleanup test application: ✅");
}
