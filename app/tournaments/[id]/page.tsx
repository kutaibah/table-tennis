import Link from "next/link";
import { notFound } from "next/navigation";

import { BracketView } from "@/components/tournament/BracketView";
import { ChampionCard } from "@/components/tournament/ChampionCard";
import { MatchesTable } from "@/components/tournament/MatchesTable";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import { dbConnect } from "@/lib/db";
import { loadTournamentBundle } from "@/lib/tournament/load";
import type { TournamentStatus } from "@/lib/tournament/constants";

export default async function PublicTournamentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await dbConnect();
  const bundle = await loadTournamentBundle(id);
  if (!bundle) notFound();

  const { tournament, bracketMatches, playerMap, totalRounds, championName } =
    bundle;

  const bestOf =
    typeof tournament.bestOf === "number" ? tournament.bestOf : 1;
  const winMarginThreshold =
    typeof tournament.winMarginThreshold === "number"
      ? tournament.winMarginThreshold
      : 1;

  const start =
    tournament.startDate != null
      ? new Date(tournament.startDate).toLocaleDateString()
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {tournament.name}
            </h1>
            <StatusBadge status={tournament.status as TournamentStatus} />
          </div>
          {tournament.description ? (
            <p className="text-muted-foreground max-w-prose text-sm">
              {tournament.description}
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            {tournament.playerCount} players
            {start ? ` · Starts ${start}` : ""}
            {" · "}
            {bestOf === 1 ? (
              <>Scores: min lead {winMarginThreshold}</>
            ) : (
              <>Best-of-{bestOf}</>
            )}
          </p>
        </div>
        <Link
          href={`/admin/tournaments/${id}`}
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          Admin
        </Link>
      </div>

      {tournament.status === "completed" && championName ? (
        <ChampionCard name={championName} />
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Bracket</h2>
        <BracketView
          matches={bracketMatches}
          playerMap={playerMap}
          totalRounds={totalRounds}
          bestOf={bestOf}
          winMarginThreshold={winMarginThreshold}
        />
      </section>

      {bracketMatches.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Matches</h2>
          <MatchesTable
            matches={bracketMatches}
            playerMap={playerMap}
            totalRounds={totalRounds}
          />
        </section>
      ) : null}
    </div>
  );
}
