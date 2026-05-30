import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Ruler,
  Sofa,
  Star,
  Users,
} from "lucide-react";
import { AREA_BY_ID, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { getDemoTenant, getListingById } from "@/lib/data";
import { distanceLabel, formatDate, formatRM, relativeFromNow } from "@/lib/format";
import { describeHabits, matchLabel } from "@/lib/match";
import { priceVerdictLabel } from "@/lib/pricing";
import type { Housemate } from "@/lib/types";
import { ListingImage } from "@/components/listing/listing-image";
import {
  MatchBadge,
  PriceBadge,
  ScamBadge,
  VerifiedBadge,
} from "@/components/listing/listing-badges";
import { ScamPanelLive } from "@/components/listing/scam-panel-live";
import { ContactActions } from "@/components/listing/contact-actions";
import { SaveButton } from "@/components/listing/save-button";

const FURNISH = {
  unfurnished: "Unfurnished",
  partial: "Partially furnished",
  full: "Fully furnished",
} as const;

const GENDER = {
  any: "Any gender",
  male: "Male only",
  female: "Female only",
} as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await getListingById(id);
  return { title: l ? l.title : "Listing not found" };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = getDemoTenant();
  const listing = await getListingById(id, { userHabits: tenant.habits });
  if (!listing) notFound();

  const area = AREA_BY_ID[listing.areaId];
  const photos = listing.photos.length ? listing.photos : [listing.id];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 lg:pb-12">
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to browse
      </Link>

      {/* Gallery */}
      <div className="mt-3 grid gap-2 sm:h-80 sm:grid-cols-4 sm:grid-rows-2">
        <ListingImage
          seed={photos[0]}
          type={listing.propertyType}
          className="h-56 rounded-2xl sm:col-span-2 sm:row-span-2 sm:h-full"
          iconClassName="size-14"
        />
        {photos.slice(1, 5).map((p) => (
          <ListingImage
            key={p}
            seed={p}
            type={listing.propertyType}
            className="hidden h-full rounded-xl sm:block"
          />
        ))}
      </div>

      {/* Title row */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {area.name}, Kota Kinabalu · {distanceLabel(listing.distanceKm)} to UMS (~
            {listing.driveMins} min)
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {listing.isVerified && <VerifiedBadge />}
            <ScamBadge level={listing.scam.level} />
            <PriceBadge fairness={listing.price_fairness} />
            {listing.housemateMatch != null && <MatchBadge score={listing.housemateMatch} />}
          </div>
        </div>
        <SaveButton id={listing.id} variant="plain" className="size-10 shrink-0" />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Fact icon={<BedDouble />} label="Bedrooms" value={`${listing.bedrooms}`} />
            <Fact icon={<Bath />} label="Bathrooms" value={`${listing.bathrooms}`} />
            <Fact
              icon={<Sofa />}
              label="Furnishing"
              value={FURNISH[listing.furnished]}
            />
            {listing.sizeSqft && (
              <Fact icon={<Ruler />} label="Size" value={`${listing.sizeSqft} sqft`} />
            )}
            <Fact
              icon={<Users />}
              label="Preference"
              value={GENDER[listing.genderPreference]}
            />
            <Fact
              icon={<CalendarDays />}
              label="Available"
              value={formatDate(listing.availableFrom)}
            />
          </div>

          {/* Description */}
          <section>
            <h2 className="font-heading text-lg font-bold">About this place</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">
              {listing.description}
            </p>
            {listing.listedVia && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> Previously advertised on {listing.listedVia}
              </p>
            )}
          </section>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-primary" />
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Housemates */}
          {listing.currentHousemates.length > 0 && (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-bold">Who you&apos;d live with</h2>
                {listing.housemateMatch != null && (
                  <span className="text-sm font-medium text-primary">
                    {listing.housemateMatch}% match · {matchLabel(listing.housemateMatch)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {tenant.fullName.split(" ")[0]}&apos;s lifestyle preferences.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {listing.currentHousemates.map((h) => (
                  <HousemateCard key={h.name} housemate={h} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {listing.reviews.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold">
                Reviews
                {listing.rating != null && (
                  <span className="ml-2 inline-flex items-center gap-1 text-base font-semibold text-muted-foreground">
                    <Star className="size-4 fill-premium text-premium" />
                    {listing.rating} · {listing.reviews.length}
                  </span>
                )}
              </h2>
              <div className="mt-3 space-y-3">
                {listing.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(r.authorName)}
                        </span>
                        <span className="text-sm font-medium">{r.authorName}</span>
                      </div>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-premium text-premium" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {relativeFromNow(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Price + contact */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-end justify-between">
              <p className="font-heading text-3xl font-extrabold">
                {formatRM(listing.price)}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Deposit {formatRM(listing.deposit)} · {priceVerdictLabel(listing.price_fairness)}
            </p>
            <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Area average for a {PROPERTY_TYPE_LABEL[listing.propertyType].toLowerCase()} in{" "}
              {area.name}: <strong className="text-foreground">{formatRM(listing.price_fairness.areaAvg)}</strong>
            </div>
            <ContactActions
              className="mt-4"
              listingId={listing.id}
              phone={listing.landlord.phone}
              title={listing.title}
              landlordName={listing.landlord.fullName}
            />
          </div>

          {/* Landlord */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">Listed by</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {initials(listing.landlord.fullName)}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold">
                  {listing.landlord.fullName}
                  {listing.landlord.isVerified && (
                    <VerifiedBadge className="px-1.5" label="" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {listing.landlord.rating != null
                    ? `★ ${listing.landlord.rating} · ${listing.landlord.reviewCount} reviews`
                    : "New landlord"}{" "}
                  · joined {relativeFromNow(listing.landlord.joinedAt)}
                </p>
              </div>
            </div>
            {!listing.landlord.isVerified && (
              <p className="mt-3 rounded-lg bg-warn/10 p-2.5 text-xs text-warn">
                This landlord hasn&apos;t completed identity verification yet.
              </p>
            )}
          </div>

          {/* Safety check */}
          <ScamPanelLive listingId={listing.id} initial={listing.scam} />
        </aside>
      </div>

      {/* Mobile sticky contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="shrink-0">
            <p className="font-heading text-lg font-extrabold leading-none">
              {formatRM(listing.price)}
            </p>
            <p className="text-[11px] text-muted-foreground">/month</p>
          </div>
          <ContactActions
            className="flex-1"
            listingId={listing.id}
            phone={listing.landlord.phone}
            title={listing.title}
            landlordName={listing.landlord.fullName}
          />
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&>svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function HousemateCard({ housemate }: { housemate: Housemate }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">
          {housemate.name[0]}
        </span>
        <div>
          <p className="font-semibold">
            {housemate.name}
            {housemate.age ? `, ${housemate.age}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">{housemate.occupation}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {describeHabits(housemate.habits).map((h) => (
          <span
            key={h}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {h}
          </span>
        ))}
      </div>
    </div>
  );
}
