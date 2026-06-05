import { createClient } from "@/lib/supabase/server";
import {
  assemblePassport,
  demoPassportFor,
  profileSlice,
  verificationsFor,
  type PaymentRecord,
  type RenterPassport,
  type TenancyRecord,
  type TenantReview,
} from "@/lib/passport";
import type { Profile } from "@/lib/types";

/**
 * The Renter Trust Passport for a profile, computed from their real records
 * (payments / tenancies / tenant_reviews). Falls back to the showcase demo
 * passport when the tables are missing or the user has no payments yet — so it
 * never looks empty in a demo or for a brand-new renter.
 */
export async function getPassportFor(profile: Profile): Promise<RenterPassport> {
  try {
    const supabase = await createClient();
    const [pay, ten, rev] = await Promise.all([
      supabase.from("payments").select("id, label, amount, paid_on, on_time").eq("tenant_id", profile.id),
      supabase.from("tenancies").select("*").eq("tenant_id", profile.id),
      supabase.from("tenant_reviews").select("*").eq("tenant_id", profile.id),
    ]);
    if (pay.error || ten.error || rev.error) return demoPassportFor(profile);

    const payments: PaymentRecord[] = (pay.data ?? []).map((r) => ({
      id: r.id as string,
      label: r.label as string,
      amount: r.amount as number,
      paidOn: r.paid_on as string,
      onTime: (r.on_time as boolean) ?? true,
    }));
    // No real history yet → show the showcase passport.
    if (payments.length === 0) return demoPassportFor(profile);

    const tenancies: TenancyRecord[] = (ten.data ?? []).map((r) => ({
      id: r.id as string,
      property: r.property as string,
      area: (r.area as string) ?? "",
      landlordName: (r.landlord_name as string) ?? "Landlord",
      landlordVerified: (r.landlord_verified as boolean) ?? false,
      start: r.start_label as string,
      end: (r.end_label as string) ?? undefined,
      months: (r.months as number) ?? 0,
      onTimeRate: (r.on_time_rate as number) ?? 100,
    }));

    const reviews: TenantReview[] = (rev.data ?? []).map((r) => ({
      id: r.id as string,
      landlordName: r.landlord_name as string,
      landlordVerified: (r.landlord_verified as boolean) ?? false,
      rating: r.rating as number,
      comment: r.comment as string,
      createdAt: r.created_at as string,
    }));

    return assemblePassport(profileSlice(profile), payments, tenancies, reviews, verificationsFor(profile));
  } catch {
    return demoPassportFor(profile);
  }
}
