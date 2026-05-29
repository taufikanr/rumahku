import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo size="lg" />
      <p className="font-heading text-5xl font-extrabold text-primary">404</p>
      <h1 className="font-heading text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        We couldn&apos;t find that page. Let&apos;s get you back to finding a safe home in Sabah.
      </p>
      <ButtonLink href="/browse" size="lg">
        Browse rooms
      </ButtonLink>
    </div>
  );
}
