"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Polls the current route so server components (bracket, feed, table) stay fresh.
 */
export function PublicTournamentLiveBoundary({
  children,
  enabled,
  pollMs = 4200,
}: {
  children: React.ReactNode;
  enabled: boolean;
  pollMs?: number;
}) {
  const router = useRouter();
  const visibleRef = useRef(true);

  useEffect(() => {
    const onVis = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      if (visibleRef.current) {
        router.refresh();
      }
    }, pollMs);
    return () => window.clearInterval(id);
  }, [enabled, pollMs, router]);

  return (
    <div className="relative">
      {enabled ? (
        <div
          className="pointer-events-none fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-xs shadow-md backdrop-blur-sm sm:bottom-6 sm:left-6"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-35" />
            <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
          </span>
          <span className="text-foreground font-medium">Live</span>
          <span className="text-muted-foreground hidden sm:inline">
            · updating
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
