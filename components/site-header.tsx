import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/auth/session";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Table Tennis Tournaments
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <ThemeToggle />
          {session ? (
            <>
              <span
                className="text-muted-foreground hidden max-w-[10rem] truncate text-xs sm:inline"
                title={session.email}
              >
                {session.email}
              </span>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/tournaments">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
