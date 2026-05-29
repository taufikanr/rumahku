"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Home, User } from "lucide-react";
import { signUpAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Role = "tenant" | "landlord";

export function SignupForm({ defaultRole = "tenant" }: { defaultRole?: Role }) {
  const [state, action, pending] = useActionState(signUpAction, undefined);
  const [role, setRole] = useState<Role>(defaultRole);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-heading text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free for renters. Landlords get a 30-day trial.
      </p>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
      )}

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="role" value={role} />
        <div className="grid grid-cols-2 gap-2">
          <RoleButton
            active={role === "tenant"}
            onClick={() => setRole("tenant")}
            icon={<User className="size-4" />}
            label="I'm renting"
          />
          <RoleButton
            active={role === "landlord"}
            onClick={() => setRole("landlord")}
            icon={<Home className="size-4" />}
            label="I'm a landlord"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">WhatsApp number</Label>
          <Input id="phone" name="phone" placeholder="+60 12-345 6789" autoComplete="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
