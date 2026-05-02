import Link from "next/link";

import type { PlayerCount, TournamentStatus } from "@/lib/tournament/constants";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/tournament/StatusBadge";

export type TournamentCardData = {
  name: string;
  description?: string | null;
  playerCount: PlayerCount | number;
  status: TournamentStatus;
  startDate?: Date | null;
};

export function TournamentCard({
  tournament,
  href,
}: {
  tournament: TournamentCardData;
  href: string;
}) {
  const sd = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString()
    : null;

  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      <Card className="h-full">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">{tournament.name}</CardTitle>
            <StatusBadge status={tournament.status} />
          </div>
          <CardDescription className="line-clamp-2">
            {tournament.description || "No description."}
          </CardDescription>
          <p className="text-muted-foreground text-sm">
            {tournament.playerCount} players
            { sd ? ` · ${sd}` : ""}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
