import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FeedRelativeTime } from "@/components/tournament/feed-relative-time";
import type { LiveFeedItem } from "@/lib/tournament/liveFeed";

function FeedRow({ item }: { item: LiveFeedItem }) {
  if (item.kind === "live") {
    const title = new Date(item.updatedAtIso).toLocaleString();
    return (
      <li className="animate-in fade-in-0 flex flex-col gap-0.5 border-b px-4 py-3 duration-300 last:border-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-sm leading-snug">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Live
            </span>
            <span className="text-muted-foreground"> · </span>
            <span className="font-medium text-foreground">
              {item.playerAName}
            </span>
            <span className="text-muted-foreground"> vs </span>
            <span className="font-medium text-foreground">
              {item.playerBName}
            </span>
            <span className="text-muted-foreground"> · games </span>
            <span className="font-mono tabular-nums">{item.scoreLine}</span>
          </p>
          <FeedRelativeTime iso={item.updatedAtIso} title={title} />
        </div>
        <p className="text-muted-foreground text-xs">
          {item.roundLabel} · #{item.matchNumber}
        </p>
        {item.gamesDetail ? (
          <p className="text-muted-foreground font-mono text-xs leading-relaxed">
            {item.gamesDetail}
          </p>
        ) : null}
      </li>
    );
  }

  const title = new Date(item.completedAtIso).toLocaleString();

  return (
    <li className="animate-in fade-in-0 flex flex-col gap-0.5 border-b px-4 py-3 duration-300 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm leading-snug">
          <span className="font-semibold text-foreground">{item.winnerName}</span>
          <span className="text-muted-foreground"> beat </span>
          <span className="font-medium text-foreground">{item.loserName}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-mono tabular-nums">{item.scoreLine}</span>
        </p>
        <FeedRelativeTime iso={item.completedAtIso} title={title} />
      </div>
      <p className="text-muted-foreground text-xs">
        {item.roundLabel} · #{item.matchNumber}
      </p>
      {item.gamesDetail ? (
        <p className="text-muted-foreground font-mono text-xs leading-relaxed">
          {item.gamesDetail}
        </p>
      ) : null}
    </li>
  );
}

export function LiveGameFeed({ items }: { items: LiveFeedItem[] }) {
  if (!items.length) {
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">Live feed</h2>
        </div>
        <Card>
          <CardContent className="text-muted-foreground p-6 text-sm">
            In-progress scores and finished results appear here as you save
            games.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium">Live feed</h2>
        <p className="text-muted-foreground text-xs">
          Live + finished · newest first · updates automatically
        </p>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm font-medium">Match updates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="max-h-[min(480px,55vh)] overflow-y-auto overscroll-contain">
            {items.map((item) => (
              <FeedRow
                key={`${item.kind}-${item.matchId}-${item.kind === "live" ? item.updatedAtIso : item.completedAtIso}`}
                item={item}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
