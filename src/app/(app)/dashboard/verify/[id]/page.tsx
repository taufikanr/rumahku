import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AREA_BY_ID } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { getListingById } from "@/lib/data";
import { VerifyCapture } from "@/components/landlord/verify-capture";

export const metadata = { title: "Verify property" };

export default async function VerifyPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile("landlord");
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const area = AREA_BY_ID[listing.areaId];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
        <ShieldCheck className="size-3.5" /> Verified Real
      </div>
      <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Prove this property is real
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A 20-second on-site capture of{" "}
        <span className="font-medium text-foreground">{listing.title}</span> in {area.name}.
        It earns a Verified Real badge that renters trust — the #1 thing they look for.
      </p>

      <div className="mt-5">
        <VerifyCapture
          listingId={listing.id}
          title={listing.title}
          areaName={area.name}
          lat={listing.lat}
          lng={listing.lng}
          alreadyVerified={listing.verification.status === "verified"}
        />
      </div>
    </div>
  );
}
