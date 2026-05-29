import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-accent/40 to-background px-4 py-10">
      <Link href="/" className="mb-6" aria-label="RumahKu home">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
