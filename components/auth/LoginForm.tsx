"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { loginAction } from "@/app/actions/auth";
import type { ActionState } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ defaultNext }: { defaultNext: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={defaultNext} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        First-time admin?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Create admin account
        </Link>
      </p>
    </form>
  );
}
