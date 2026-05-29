"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(signInAction, undefined);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to your RumahKu account.</p>

      {notice && (
        <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">{notice}</p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
      )}

      <form action={action} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts</p>
        <p>Tenant — tenant@demo.rumahku.my</p>
        <p>Landlord — landlord@demo.rumahku.my</p>
        <p>Password — rumahku123</p>
      </div>
    </div>
  );
}
