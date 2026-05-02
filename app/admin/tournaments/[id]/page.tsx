import Link from "next/link";
import { notFound } from "next/navigation";

import { BracketView } from "@/components/tournament/BracketView";
import { ChampionCard } from "@/components/tournament/ChampionCard";
import { DeleteTournamentButton } from "@/components/tournament/DeleteTournamentButton";
import { EditTournamentForm } from "@/components/tournament/EditTournamentForm";
import { GenerateDrawButton } from "@/components/tournament/GenerateDrawButton";
import { MatchesTable } from "@/components/tournament/MatchesTable";
import { PlayerForm } from "@/components/tournament/PlayerForm";
import { PlayerList } from "@/components/tournament/PlayerList";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { dbConnect } from "@/lib/db";
import { loadTournamentBundle } from "@/lib/tournament/load";
import type { TournamentStatus } from "@/lib/tournament/constants";

export default async function AdminTournamentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await dbConnect();
  const bundle = await loadTournamentBundle(id);
  if (!bundle) notFound();

  const {
    tournament,
    players,
    bracketMatches,
    playerMap,
    totalRounds,
    championName,
  } = bundle;

  const status = tournament.status as TournamentStatus;
  const playerRows = players.map((p) => ({
    _id: String(p._id),
    name: p.name,
    nickname: p.nickname ?? undefined,
    seed: p.seed ?? undefined,
  }));

  const startIso =
    tournament.startDate != null
      ? new Date(tournament.startDate).toISOString()
      : undefined;

  const bestOf =
    typeof tournament.bestOf === "number" ? tournament.bestOf : 1;
  const winMarginThreshold =
    typeof tournament.winMarginThreshold === "number"
      ? tournament.winMarginThreshold
      : 1;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {tournament.name}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {tournament.playerCount} players
            {" · "}
            {bestOf === 1 ? (
              <>
                Single-total scores · min lead {winMarginThreshold}
              </>
            ) : (
              <>Best-of-{bestOf} (games won)</>
            )}
            {" · "}Admin
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/tournaments">All tournaments</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tournaments/${id}`}>Public view</Link>
            </Button>
          </div>
        </div>
        {status === "draft" || status === "players_added" ? (
          <DeleteTournamentButton tournamentId={id} />
        ) : null}
      </div>

      {status === "completed" && championName ? (
        <ChampionCard name={championName} />
      ) : null}

      {status === "draft" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Tournament details</h2>
          <EditTournamentForm
            tournamentId={id}
            name={tournament.name}
            description={tournament.description ?? undefined}
            startDateIso={startIso}
            bestOf={bestOf}
            winMarginThreshold={winMarginThreshold}
          />
        </section>
      ) : null}

      <Separator />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-medium">Players</h2>
          <GenerateDrawButton
            tournamentId={id}
            playerCount={tournament.playerCount}
            currentCount={players.length}
            status={status}
          />
        </div>
        <PlayerList tournamentId={id} players={playerRows} status={status} />
        <PlayerForm
          tournamentId={id}
          playerCount={tournament.playerCount}
          currentCount={players.length}
          status={status}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Bracket & results</h2>
        <p className="text-muted-foreground text-sm">
          Enter scores for each pending match. Winners advance automatically.
        </p>
        <BracketView
          matches={bracketMatches}
          playerMap={playerMap}
          totalRounds={totalRounds}
          bestOf={bestOf}
          winMarginThreshold={winMarginThreshold}
          showResultForms={
            status === "drawn" || status === "in_progress"
          }
        />
      </section>

      {bracketMatches.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">All matches</h2>
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
