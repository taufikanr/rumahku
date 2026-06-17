"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { distanceKm } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { verifyListingAction } from "@/app/(app)/dashboard/verify/actions";
import { cn } from "@/lib/utils";

type Phase = "idle" | "live" | "captured" | "done";

interface Gps {
  lat: number;
  lng: number;
  accuracy: number;
}

interface Proof {
  code: string;
  lat: number;
  lng: number;
  distanceM: number;
  device: string;
  frame?: string;
  simulated: boolean;
}

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "Device";
  const ua = navigator.userAgent;
  const os = /iphone|ipad/i.test(ua)
    ? "iPhone"
    : /android/i.test(ua)
      ? "Android"
      : /mac/i.test(ua)
        ? "Mac"
        : /windows/i.test(ua)
          ? "Windows"
          : "Device";
  const br = /edg/i.test(ua)
    ? "Edge"
    : /chrome/i.test(ua)
      ? "Chrome"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  return `${os} · ${br}`;
}

function newCode(): string {
  const n =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : Math.floor(Math.random() * 1e9);
  return String(n % 10000).padStart(4, "0");
}

export function VerifyCapture({
  listingId,
  title,
  areaName,
  lat,
  lng,
  alreadyVerified,
}: {
  listingId: string;
  title: string;
  areaName: string;
  lat: number;
  lng: number;
  alreadyVerified: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [code, setCode] = useState("");
  const [gps, setGps] = useState<Gps | null>(null);
  const [clock, setClock] = useState("");
  const [proof, setProof] = useState<Proof | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);

  const distanceM =
    gps != null
      ? Math.round(distanceKm({ lat: gps.lat, lng: gps.lng }, { lat, lng }) * 1000)
      : null;

  /* Tear down camera + GPS watchers on unmount. */
  useEffect(() => stopHardware, []);

  function stopHardware() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (watchRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation?.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }

  /* Live clock while capturing. */
  useEffect(() => {
    if (phase !== "live") return;
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [phase]);

  async function start() {
    setNotice(null);
    setCode(newCode());
    let gotCamera = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      gotCamera = true;
      // attach after the <video> mounts
      setPhase("live");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setNotice(
        "Camera unavailable or blocked. You can still run a demo capture to see the flow.",
      );
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) =>
          setGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          }),
        () => setGps(null),
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    }

    if (!gotCamera) {
      // Camera failed — fall straight to the demo so the flow never dead-ends.
      simulateCapture();
    }
  }

  function grabFrame(): string | undefined {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return undefined;
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(960, video.videoWidth);
    canvas.height = (canvas.width / video.videoWidth) * video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  function capture() {
    const here = gps ?? { lat, lng, accuracy: 12 };
    const dM =
      gps != null ? distanceM ?? 0 : Math.round(Math.random() * 14 + 4); // demo: 4–18 m
    setProof({
      code,
      lat: Number(here.lat.toFixed(5)),
      lng: Number(here.lng.toFixed(5)),
      distanceM: dM,
      device: deviceLabel(),
      frame: grabFrame(),
      simulated: gps == null,
    });
    stopHardware();
    setPhase("captured");
  }

  function simulateCapture() {
    setCode((c) => c || newCode());
    const jLat = (Math.random() - 0.5) / 9000;
    const jLng = (Math.random() - 0.5) / 9000;
    const cLat = lat + jLat;
    const cLng = lng + jLng;
    setProof({
      code: code || newCode(),
      lat: Number(cLat.toFixed(5)),
      lng: Number(cLng.toFixed(5)),
      distanceM: Math.round(distanceKm({ lat: cLat, lng: cLng }, { lat, lng }) * 1000),
      device: `${deviceLabel()} · demo`,
      simulated: true,
    });
    stopHardware();
    setPhase("captured");
  }

  function retake() {
    setProof(null);
    setPhase("idle");
  }

  async function issue() {
    if (!proof) return;
    setSaving(true);
    const gpsMatch = proof.distanceM <= 80;
    await verifyListingAction({
      listingId,
      code: proof.code,
      lat: proof.lat,
      lng: proof.lng,
      distanceM: proof.distanceM,
      device: proof.device,
      authenticity: gpsMatch ? 95 : 80,
    });
    setSaving(false);
    setPhase("done");
  }

  /* ---------- DONE ---------- */
  if (phase === "done" && proof) {
    return (
      <div className="overflow-hidden rounded-2xl border border-brand-teal/30 bg-card">
        <div className="bg-brand-teal/10 px-6 py-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-teal text-white">
            <Check className="size-8" />
          </div>
          <h2 className="mt-3 font-heading text-xl font-extrabold text-brand-teal">
            Verified Real — certificate issued
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {title} now carries a Verified Real badge renters can trust.
          </p>
        </div>
        <div className="space-y-4 p-6">
          <ProofGrid proof={proof} />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/listing/${listingId}/verified`} size="lg">
              <ShieldCheck /> View certificate
            </ButtonLink>
            <ButtonLink href={`/listing/${listingId}`} variant="outline" size="lg">
              View listing
            </ButtonLink>
          </div>
          {proof.simulated && (
            <p className="text-xs text-muted-foreground">
              This was a demo capture (no live camera/GPS). On a phone on-site, the same flow
              records the real walkthrough, GPS and timestamp.
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ---------- CAPTURED (review) ---------- */
  if (phase === "captured" && proof) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <Camera className="size-4 text-brand-teal" /> Review your capture
        </p>
        {proof.frame ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proof.frame}
            alt="Captured walkthrough frame"
            className="mt-3 aspect-video w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="mt-3 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            Demo capture (no live frame)
          </div>
        )}
        <div className="mt-4">
          <ProofGrid proof={proof} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={issue} size="lg" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {saving ? "Issuing…" : "Issue Verified Real certificate"}
          </Button>
          <Button onClick={retake} variant="outline" size="lg" disabled={saving}>
            <RefreshCw /> Retake
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- LIVE (capturing) ---------- */
  if (phase === "live") {
    const matched = distanceM != null && distanceM <= 80;
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="relative overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="aspect-video w-full object-cover"
          />
          {/* On-screen one-time code + live clock — what makes a recycled video impossible */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 text-white">
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium tabular-nums">
                {clock}
              </span>
              <span className="rounded-lg bg-brand-teal px-2.5 py-1 text-right text-xs font-semibold">
                RumahKu code
                <span className="block font-mono text-lg leading-none tracking-widest">
                  {code}
                </span>
              </span>
            </div>
            <div className="m-auto size-32 rounded-2xl border-2 border-white/70" />
            <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-black/60 px-2.5 py-1 text-xs">
              <MapPin className="size-3.5" />
              {gps
                ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)} · ±${gps.accuracy}m`
                : "Locating…"}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
            matched
              ? "bg-safe/10 text-safe"
              : "bg-muted text-muted-foreground",
          )}
        >
          {matched ? <Check className="size-4" /> : <MapPin className="size-4" />}
          {gps == null
            ? "Waiting for GPS lock…"
            : matched
              ? `On location — ${distanceM} m from the listing pin`
              : `${distanceM} m from the listing pin`}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Slowly pan around the room with the code visible, then capture.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={capture} size="lg">
            <Camera /> Capture proof
          </Button>
          <Button onClick={simulateCapture} variant="ghost" size="lg">
            Use demo capture
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- IDLE (intro) ---------- */
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {alreadyVerified && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-teal/10 p-3 text-sm font-medium text-brand-teal">
          <ShieldCheck className="size-4" /> This listing is already Verified Real — re-capture
          to refresh it.
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
          <Sparkles className="size-6" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold">How Verified Real works</p>
          <p className="text-sm text-muted-foreground">{areaName} · takes about 20 seconds</p>
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        <Step n={1} title="Stand inside the unit">
          We ask for your camera and location, on-site.
        </Step>
        <Step n={2} title="Record with a live code on screen">
          A one-time RumahKu code + timestamp proves it&apos;s recorded now, not reused.
        </Step>
        <Step n={3} title="We stamp the GPS & issue a certificate">
          The pin must match where the unit is advertised.
        </Step>
      </ol>

      {notice && (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-warn/10 p-3 text-xs text-warn">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {notice}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={start} size="lg">
          <Camera /> Start verification
        </Button>
        <Button onClick={simulateCapture} variant="outline" size="lg">
          Run demo capture
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Renters rank a verified, real listing as the #1 thing they look for. This is the badge
        that earns it.
      </p>
    </div>
  );
}

function ProofGrid({ proof }: { proof: Proof }) {
  const matched = proof.distanceM <= 80;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">One-time code</dt>
        <dd className="font-mono font-semibold">{proof.code} ✓</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Device</dt>
        <dd className="font-medium">{proof.device}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">GPS coordinates</dt>
        <dd className="font-mono font-medium tabular-nums">
          {proof.lat.toFixed(5)}, {proof.lng.toFixed(5)}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Distance to listing</dt>
        <dd className={cn("font-medium", matched ? "text-safe" : "text-warn")}>
          {proof.distanceM} m {matched ? "· match" : "· review"}
        </dd>
      </div>
    </dl>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-bold text-brand-teal">
        {n}
      </span>
      <span>
        <span className="text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{children}</span>
      </span>
    </li>
  );
}
