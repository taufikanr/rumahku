import { createClient } from "@supabase/supabase-js";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

await s.auth.signInWithPassword({ email: "tenant@demo.rumahku.my", password: "rumahku123" });
const { data: bills, error } = await s
  .from("bills")
  .select("label,amount,due_date,status")
  .order("due_date");
console.log(error ? "❌ bills: " + error.message : `✅ tenant reads ${bills.length} bills:`);
for (const b of bills ?? []) {
  console.log(`   • ${b.label} — RM${b.amount} — due ${b.due_date} — ${b.status}`);
}
await s.auth.signOut();

await s.auth.signInWithPassword({ email: "landlord@demo.rumahku.my", password: "rumahku123" });
const {
  data: { user },
} = await s.auth.getUser();
const { error: te } = await s
  .from("tenancy_agreements")
  .insert({ landlord_id: user.id, listing_id: null, data: { test: true } });
console.log(te ? "❌ tenancy insert: " + te.message : "✅ landlord tenancy insert OK");
await s.from("tenancy_agreements").delete().eq("landlord_id", user.id);
await s.auth.signOut();
