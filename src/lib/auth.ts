import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { LifestyleHabits, Profile, Role } from "@/lib/types";

interface ProfileRow {
  id: string;
  role: Role;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  occupation: string | null;
  affiliation: string | null;
  bio: string | null;
  is_verified: boolean;
  rating: number | null;
  review_count: number;
  habits: LifestyleHabits | null;
  created_at: string;
}

function mapProfile(row: ProfileRow, fallbackEmail?: string): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email ?? fallbackEmail ?? "",
    phone: row.phone ?? "",
    gender: (row.gender as Profile["gender"]) ?? undefined,
    occupation: row.occupation ?? undefined,
    affiliation: row.affiliation ?? undefined,
    bio: row.bio ?? undefined,
    habits: row.habits ?? undefined,
    isVerified: row.is_verified ?? false,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? 0,
    joinedAt: row.created_at,
  };
}

/** The signed-in user's profile, or null (also null when Supabase isn't configured). */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return mapProfile(data as ProfileRow, user.email ?? undefined);
}

/** Require a signed-in user (optionally with a role); redirect otherwise. */
export async function requireProfile(role?: Role): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (role && profile.role !== role) {
    redirect(profile.role === "landlord" ? "/dashboard" : "/browse");
  }
  return profile;
}
