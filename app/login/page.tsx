import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/auth/redirects";

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await props.searchParams;
  const defaultNext = safeRedirectPath(next);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Admin access to manage tournaments.
        </p>
      </div>
      <LoginForm defaultNext={defaultNext} />
      <p className="text-muted-foreground text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  );
}
