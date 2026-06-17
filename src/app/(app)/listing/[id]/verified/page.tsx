import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Check,
  Fingerprint,
  Globe,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { AREA_BY_ID, RESEARCH } from "@/lib/constants";
import { getListingById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";
import { CertificateShare } from "@/components/listing/certificate-share";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await getListingById(id);
  return { title: l ? `Verified Real — ${l.title}` : "Authenticity certificate" };
}

export default async function VerifiedCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const v = listing.verification;
  const area = AREA_BY_ID[listing.areaId];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href={`/listing/${listing.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to listing
      </Link>

      {v.status === "verified" ? (
        <>
          {/* Certificate */}
          <div className="mt-3 overflow-hidden rounded-3xl border border-brand-teal/30 bg-card shadow-sm">
            <div className="bg-brand-teal/10 px-6 py-6 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-teal text-white">
                <ShieldCheck className="size-9" />
              </div>
              <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-brand-teal">
                Verified Real
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Proof-of-Property certificate · issued by RumahKu
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 font-mono text-xs font-semibold text-foreground">
                <Fingerprint className="size-3.5" /> {v.certificateId}
              </p>
            </div>

            <div className="space-y-6 p-6">
              {/* What was verified */}
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Property
                </p>
                <p className="mt-1 font-heading text-lg font-bold">{listing.title}</p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {area.name}, Kota Kinabalu · listed by {listing.landlord.fullName}
                </p>
              </div>

              {/* Authenticity score */}
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Authenticity score</span>
                  <span className="font-semibold text-foreground">{v.authenticity}/100</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-teal"
                    style={{ width: `${Math.max(4, v.authenticity)}%` }}
                  />
                </div>
              </div>

              {/* Capture proof */}
              {v.capture && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Camera className="size-4 text-brand-teal" /> On-site live capture
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <Field label="Captured on" value={formatDate(v.capture.capturedAt)} />
                    <Field label="Device" value={v.capture.device} />
                    <Field
                      label="GPS coordinates"
                      value={`${v.capture.lat.toFixed(5)}, ${v.capture.lng.toFixed(5)}`}
                      mono
                    />
                    <Field
                      label="Distance to listing"
                      value={`${v.capture.distanceM} m`}
                    />
                    <Field label="One-time code" value={`${v.capture.code} matched`} mono />
                    <Field
                      label="Photos checked"
                      value={`${v.photoChecks.length} · all original`}
                    />
                  </dl>
                </div>
              )}

              {/* Checklist */}
              <ul className="space-y-2">
                {v.checks.map((c) => (
                  <li key={c.key} className="flex items-start gap-2 text-sm">
                    {c.pass ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-safe" />
                    ) : (
                      <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span>
                      {c.label}
                      <span className="block text-xs text-muted-foreground">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <CertificateShare certificateId={v.certificateId} />
                <ButtonLink href={`/listing/${listing.id}`} variant="ghost" size="lg">
                  View full listing
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* What this means + honest roadmap */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p className="font-heading text-base font-bold text-foreground">
              Why this matters
            </p>
            <p className="mt-2">
              {RESEARCH.scamAffectedPct}% of renters we surveyed had been scammed or almost
              scammed — usually by a listing with stolen photos that never existed. A scam
              detector can only flag <em>suspicious</em> text. Verified Real proves the unit is{" "}
              <strong className="text-foreground">physically real</strong> and that the lister
              was standing in it.
            </p>
            <p className="mt-3 flex items-start gap-2">
              <Globe className="mt-0.5 size-4 shrink-0 text-brand-teal" />
              <span>
                <strong className="text-foreground">In production</strong>, photo checks extend
                to a full open-web reverse-image search and the capture is timestamped on a
                tamper-evident log — so a certificate can be trusted even when shared outside
                RumahKu.
              </span>
            </p>
          </div>
        </>
      ) : (
        /* Not verified / flagged */
        <div className="mt-3 rounded-3xl border border-border bg-card p-8 text-center">
          <div
            className={
              v.status === "flagged"
                ? "mx-auto flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger"
                : "mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
            }
          >
            {v.status === "flagged" ? (
              <ShieldAlert className="size-9" />
            ) : (
              <Shield className="size-9" />
            )}
          </div>
          <h1 className="mt-3 font-heading text-xl font-bold">
            {v.status === "flagged"
              ? "This listing isn't Verified Real"
              : "Not yet Verified Real"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {v.status === "flagged"
              ? v.flagReason
              : "No on-site Proof-of-Property capture exists for this unit yet, so we can't issue an authenticity certificate."}
          </p>
          <div className="mt-5">
            <ButtonLink href={`/listing/${listing.id}`} size="lg">
              Back to listing
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-sm font-medium" : "text-sm font-medium"}>
        {value}
      </dd>
    </div>
  );
}
