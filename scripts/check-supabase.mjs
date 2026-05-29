import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", url);
console.log("anon key present:", !!anon, "| service key present:", !!service);

const admin = createClient(url, service, { auth: { persistSession: false } });
const { data, error } = await admin.auth.admin.listUsers();
if (error) {
  console.error("❌ service_role / admin error:", error.message);
  process.exit(1);
}
console.log(`✅ service_role works. Existing auth users: ${data.users.length}`);

const anonClient = createClient(url, anon, { auth: { persistSession: false } });
const { error: aerr } = await anonClient.auth.getSession();
console.log(aerr ? `❌ anon error: ${aerr.message}` : "✅ anon/publishable key works.");
