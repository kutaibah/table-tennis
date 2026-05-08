"use client";

import { useEffect, useState } from "react";

import { formatFeedTimeAgo } from "@/lib/tournament/liveFeed";

/** Re-renders on an interval so “2m ago” keeps feeling live between page refreshes. */
export function FeedRelativeTime({
  iso,
  title,
}: {
  iso: string;
  title: string;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 12000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time
      className="text-muted-foreground shrink-0 text-xs tabular-nums"
      dateTime={iso}
      title={title}
    >
      {formatFeedTimeAgo(iso)}
    </time>
  );
}
