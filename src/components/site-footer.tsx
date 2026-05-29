import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30 print:hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Sabah&apos;s trusted rental platform — verified listings, scam protection,
              and fair prices for Kota Kinabalu and beyond.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-heading font-semibold">Renters</span>
              <Link href="/browse" className="text-muted-foreground hover:text-foreground">Browse rooms</Link>
              <Link href="/saved" className="text-muted-foreground hover:text-foreground">Saved</Link>
              <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">How it works</Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-heading font-semibold">Landlords</span>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">List a property</Link>
              <Link href="/#for-landlords" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/signup" className="text-muted-foreground hover:text-foreground">Get started</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} RumahKu · A KD04503 Technopreneurship MVP by Group 10,
            Universiti Malaysia Sabah. Built for Sabah renters.
          </p>
        </div>
      </div>
    </footer>
  );
}
