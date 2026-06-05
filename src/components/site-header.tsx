"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n";
import type { Role } from "@/lib/types";

type HeaderUser = { fullName: string; role: Role } | null;
type NavItem = { href: string; key: string };

const GUEST_NAV: NavItem[] = [
  { href: "/browse", key: "nav.browseRooms" },
  { href: "/#how-it-works", key: "nav.howItWorks" },
  { href: "/#for-landlords", key: "nav.forLandlords" },
];

function navFor(user: HeaderUser): { primary: NavItem[]; secondary: NavItem[] } {
  if (!user) return { primary: GUEST_NAV, secondary: [] };
  if (user.role === "landlord")
    return {
      primary: [
        { href: "/browse", key: "nav.browse" },
        { href: "/dashboard", key: "nav.dashboard" },
        { href: "/deposits", key: "nav.deposits" },
        { href: "/messages", key: "nav.messages" },
      ],
      secondary: [
        { href: "/dashboard/tenancy", key: "nav.tenancy" },
        { href: "/viewings", key: "nav.viewingRequests" },
      ],
    };
  return {
    primary: [
      { href: "/browse", key: "nav.browse" },
      { href: "/passport", key: "nav.passport" },
      { href: "/deposits", key: "nav.deposits" },
      { href: "/messages", key: "nav.messages" },
    ],
    secondary: [
      { href: "/saved", key: "nav.savedListings" },
      { href: "/alerts", key: "nav.savedSearches" },
      { href: "/viewings", key: "nav.myViewings" },
      { href: "/bills", key: "nav.bills" },
    ],
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UnreadDot({ href, unread }: { href: string; unread: number }) {
  if (href !== "/messages" || unread <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {unread}
    </span>
  );
}

export function SiteHeader({
  user = null,
  unread = 0,
  lang = "en",
}: {
  user?: HeaderUser;
  unread?: number;
  lang?: Lang;
}) {
  const pathname = usePathname();
  const { primary, secondary } = navFor(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="RumahKu home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {t(lang, item.key)}
              <UnreadDot href={item.href} unread={unread} />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher lang={lang} />
          {user ? (
            <>
              <form id="logout-form" action={signOutAction} className="hidden" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-muted" />
                  }
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initials(user.fullName)}
                  </span>
                  <span className="text-sm font-medium">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {secondary.map((item) => (
                    <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                      {t(lang, item.key)}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<button type="submit" form="logout-form" className="w-full" />}
                  >
                    <LogOut className="size-4" /> {t(lang, "cta.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="lg">
                {t(lang, "cta.login")}
              </ButtonLink>
              <ButtonLink href="/signup" size="lg">
                {t(lang, "cta.getStarted")}
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
              {[...primary, ...secondary].map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  {t(lang, item.key)}
                  <UnreadDot href={item.href} unread={unread} />
                </SheetClose>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 px-4 pb-6">
              <LanguageSwitcher lang={lang} className="self-start" />
              {user ? (
                <>
                  <p className="px-1 text-sm text-muted-foreground">
                    Signed in as <span className="font-medium text-foreground">{user.fullName}</span>
                  </p>
                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" size="lg" className="w-full">
                      <LogOut /> {t(lang, "cta.logout")}
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
                    {t(lang, "cta.login")}
                  </SheetClose>
                  <SheetClose
                    render={
                      <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))} />
                    }
                  >
                    {t(lang, "cta.getStarted")}
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
