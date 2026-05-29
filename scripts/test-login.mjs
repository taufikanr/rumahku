import { createClient } from "@supabase/supabase-js";

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

for (const email of ["landlord@demo.rumahku.my", "tenant@demo.rumahku.my"]) {
  const { data, error } = await s.auth.signInWithPassword({
    email,
    password: "rumahku123",
  });
  if (error) console.log(`❌ ${email}: ${error.message}`);
  else console.log(`✅ ${email} — role: ${data.user.user_metadata.role}`);
  await s.auth.signOut();
}
