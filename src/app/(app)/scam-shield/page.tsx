import { MessageCircle, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import { RESEARCH } from "@/lib/constants";
import { ScamShieldTool } from "@/components/scam-shield/scam-shield-tool";

export const metadata = {
  title: "Scam Shield — check any rental listing with AI",
  description:
    "Paste any rental listing or message from Facebook, WhatsApp or Mudah and RumahKu's AI tells you in seconds if it's likely a scam.",
};

export default function ScamShieldPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.16),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6 lg:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5 text-brand-teal" /> AI-powered · free · no account needed
          </span>
          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Paste any listing.
            <br />
            Know in seconds if it&apos;s a <span className="text-brand-teal">scam.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Found a room on Facebook, WhatsApp or Mudah? Don&apos;t guess. Drop the post or message
            in and RumahKu&apos;s AI flags the scam signals — and tells you exactly what to do next.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" /> Facebook groups
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" /> WhatsApp messages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="size-4" /> Mudah / iBilik listings
            </span>
          </div>
        </div>
      </section>

      {/* Tool */}
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <ScamShieldTool />

        {/* Why it works */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-muted/30 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{RESEARCH.scamAffectedPct}% of Sabah renters</strong>{" "}
            we surveyed had been scammed or almost scammed — almost always on an unmoderated channel.
            Scam Shield meets renters where they already are: you don&apos;t have to move off Facebook
            to stay safe. For total peace of mind, rent a{" "}
            <strong className="text-foreground">Verified Real</strong> listing on RumahKu — proven to
            physically exist.
          </p>
        </div>
      </section>
    </>
  );
}
