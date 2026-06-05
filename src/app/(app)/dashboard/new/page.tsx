import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ListingForm } from "@/components/landlord/listing-form";

export const metadata = { title: "Post a listing" };

export default async function NewListingPage() {
  const profile = await requireProfile("landlord");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>
      <h1 className="mt-3 mb-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Post a new listing
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fill in the details — the live check on the right shows how renters will see it.
      </p>
      <ListingForm landlordVerified={profile.isVerified} userId={profile.id} />
    </div>
  );
}
