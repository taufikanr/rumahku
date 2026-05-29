"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type HeaderUser = { fullName: string; role: Role } | null;

const GUEST_NAV = [
  { href: "/browse", label: "Browse rooms" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-landlords", label: "For landlords" },
];

function navFor(user: HeaderUser) {
  if (!user) return GUEST_NAV;
  if (user.role === "landlord")
    return [
      { href: "/browse", label: "Browse rooms" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/tenancy", label: "Tenancy" },
    ];
  return [
    { href: "/browse", label: "Browse rooms" },
    { href: "/saved", label: "Saved" },
    { href: "/bills", label: "Bills" },
  ];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SiteHeader({ user = null }: { user?: HeaderUser }) {
  const pathname = usePathname();
  const nav = navFor(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="RumahKu home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials(user.fullName)}
                </span>
                <span className="text-sm font-medium">{user.fullName.split(" ")[0]}</span>
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="lg" aria-label="Log out">
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="lg">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" size="lg">
                Get started
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {nav.map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-2 px-4 pb-6">
              {user ? (
                <>
                  <p className="px-1 text-sm text-muted-foreground">
                    Signed in as <span className="font-medium text-foreground">{user.fullName}</span>
                  </p>
                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" size="lg" className="w-full">
                      <LogOut /> Log out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <SheetClose
                    render={
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                      />
                    }
                  >
                    Log in
                  </SheetClose>
                  <SheetClose
                    render={
                      <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))} />
                    }
                  >
                    Get started
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
