"use client";

import { useActionState, useState } from "react";
import { Sparkles } from "lucide-react";
import { createListingAction } from "@/app/(app)/dashboard/actions";
import {
  AREAS,
  PROPERTY_TYPES,
  type AreaId,
  type PropertyType,
} from "@/lib/constants";
import { computePriceFairness, priceVerdictLabel } from "@/lib/pricing";
import { computeScamRisk } from "@/lib/scam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScamPanel } from "@/components/listing/scam-panel";
import { PriceBadge } from "@/components/listing/listing-badges";
import { PhotoUploader } from "@/components/landlord/photo-uploader";
import { VideoUploader } from "@/components/landlord/video-uploader";

const SELECT_CLS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const AMENITIES = [
  "WiFi",
  "Air-conditioning",
  "Water heater",
  "Washing machine",
  "Shared kitchen",
  "Parking",
  "Study desk",
  "24h security",
];

export function ListingForm({
  landlordVerified,
  userId,
}: {
  landlordVerified: boolean;
  userId: string;
}) {
  const [state, action, pending] = useActionState(createListingAction, undefined);
  const [area, setArea] = useState<AreaId | "">("");
  const [type, setType] = useState<PropertyType>("room");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");

  const priceNum = Number(price) || 0;
  const showPreview = Boolean(area && priceNum > 0);
  const fairness = showPreview
    ? computePriceFairness(priceNum, area as AreaId, type)
    : null;
  const scam =
    showPreview && fairness
      ? computeScamRisk({
          price: priceNum,
          expectedPrice: fairness.areaAvg,
          isVerifiedLandlord: landlordVerified,
          photoCount: 4,
          description,
          depositMonths: 2,
          landlordAgeDays: 400,
          hasDigitalContract: landlordVerified,
        })
      : null;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {state?.error && (
          <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
        )}

        <Field label="Listing title" htmlFor="title" required>
          <Input id="title" name="title" required placeholder="e.g. Cozy furnished room near UMS" />
        </Field>

        <Field label="Description" htmlFor="description" required>
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the room, the area, house rules, and what's included…"
          />
        </Field>

        <div>
          <Label className="mb-2 block">Photos</Label>
          <PhotoUploader userId={userId} />
        </div>

        <div>
          <Label className="mb-2 block">Verified walkthrough video (optional)</Label>
          <VideoUploader userId={userId} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Area" htmlFor="area" required>
            <select
              id="area"
              name="area"
              required
              className={SELECT_CLS}
              value={area}
              onChange={(e) => setArea(e.target.value as AreaId)}
            >
              <option value="">Select area</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Property type" htmlFor="type">
            <select
              id="type"
              name="type"
              className={SELECT_CLS}
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Monthly rent (RM)" htmlFor="price" required>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450"
            />
          </Field>
          <Field label="Deposit (RM)" htmlFor="deposit">
            <Input id="deposit" name="deposit" type="number" min={0} placeholder="auto = 2 months" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Bedrooms" htmlFor="bedrooms">
            <Input id="bedrooms" name="bedrooms" type="number" min={1} defaultValue={1} />
          </Field>
          <Field label="Bathrooms" htmlFor="bathrooms">
            <Input id="bathrooms" name="bathrooms" type="number" min={1} defaultValue={1} />
          </Field>
          <Field label="Size (sqft)" htmlFor="size">
            <Input id="size" name="size" type="number" min={0} placeholder="optional" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Furnishing" htmlFor="furnished">
            <select id="furnished" name="furnished" className={SELECT_CLS} defaultValue="full">
              <option value="unfurnished">Unfurnished</option>
              <option value="partial">Partially furnished</option>
              <option value="full">Fully furnished</option>
            </select>
          </Field>
          <Field label="Tenant preference" htmlFor="gender">
            <select id="gender" name="gender" className={SELECT_CLS} defaultValue="any">
              <option value="any">Any gender</option>
              <option value="female">Female only</option>
              <option value="male">Male only</option>
            </select>
          </Field>
        </div>

        <Field label="Available from" htmlFor="availableFrom">
          <Input id="availableFrom" name="availableFrom" type="date" />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Amenities</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="amenities" value={a} className="size-4 accent-primary" />
                {a}
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Publishing…" : "Publish listing"}
        </Button>
      </div>

      {/* Live preview */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" /> Live check
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            See how renters will judge your listing before you publish.
          </p>
          {showPreview && fairness ? (
            <div className="mt-3">
              <PriceBadge fairness={fairness} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {priceVerdictLabel(fairness)} (area avg RM{fairness.areaAvg})
              </p>
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              Enter an area and monthly rent to preview the price check and safety score.
            </p>
          )}
        </div>
        {scam && <ScamPanel scam={scam} />}
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Label>
      {children}
    </div>
  );
}
