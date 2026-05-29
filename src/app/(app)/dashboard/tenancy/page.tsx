import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { TenancyGenerator } from "@/components/landlord/tenancy-generator";

export const metadata = { title: "Tenancy agreement" };

export default async function TenancyPage() {
  const profile = await requireProfile("landlord");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
        <h1 className="mt-3 mb-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Tenancy agreement generator
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Fill in the details — the agreement updates live. Print, save as PDF, or store it to
          your account.
        </p>
      </div>
      <TenancyGenerator landlordName={profile.fullName} />
    </div>
  );
}
