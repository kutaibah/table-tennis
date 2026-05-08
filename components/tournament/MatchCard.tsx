import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResultForm } from "@/components/tournament/ResultForm";
import {
  displayName,
  roundColumnTitle,
  type BracketMatch,
  type PlayerMap,
} from "@/lib/tournament/bracketDisplay";
import { scoreEntryHint } from "@/lib/tournament/scoreRules";

export function MatchCard({
  match,
  playerMap,
  totalRounds,
  showResultForm,
  bestOf = 1,
  winMarginThreshold = 1,
}: {
  match: BracketMatch;
  playerMap: PlayerMap;
  totalRounds: number;
  showResultForm?: boolean;
  bestOf?: number;
  winMarginThreshold?: number;
}) {
  const titleRound = roundColumnTitle(match.round, totalRounds);
  const aName = displayName(playerMap, match.playerAId);
  const bName = displayName(playerMap, match.playerBId);
  const waitingA = !match.playerAId;
  const waitingB = !match.playerBId;
  const winnerName = displayName(playerMap, match.winnerPlayerId);

  const gamesToWin = Math.ceil(bestOf / 2);

  const canEnterScores =
    showResultForm &&
    (match.status === "pending" || match.status === "live") &&
    !waitingA &&
    !waitingB;

  const hint =
    canEnterScores && match.status === "pending"
      ? scoreEntryHint(bestOf, winMarginThreshold)
      : canEnterScores && match.status === "live"
        ? `Match in progress (${match.playerAScore ?? 0}–${match.playerBScore ?? 0} games, A–B). Add the next game or fix a row, then save. First to ${gamesToWin} games wins.`
        : undefined;

  const resultFormKey = `${match._id}-${bestOf}-${(match.gameScores ?? []).map((g) => `${g.a}:${g.b}`).join(",")}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>
            {titleRound} — Match {match.matchNumber}
            {bestOf > 1 ? (
              <span className="text-muted-foreground font-normal">
                {" "}
                · Bo{bestOf}
              </span>
            ) : (
              <span className="text-muted-foreground font-normal">
                {" "}
                · 1 game (±{winMarginThreshold})
              </span>
            )}
          </span>
          {match.status === "live" ? (
            <Badge
              variant="outline"
              className="border-amber-500/60 text-amber-800 dark:text-amber-300"
            >
              Live
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className={waitingA ? "text-muted-foreground italic" : ""}>
            {waitingA ? "Waiting for previous winners" : aName}
          </div>
          <span className="text-muted-foreground text-center">vs</span>
          <div className={waitingB ? "text-muted-foreground italic" : ""}>
            {waitingB ? "Waiting for previous winners" : bName}
          </div>
        </div>

        {!waitingA && !waitingB ? (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4 font-mono text-base">
              <span>{match.playerAScore ?? "—"}</span>
              <span className="text-muted-foreground">:</span>
              <span>{match.playerBScore ?? "—"}</span>
            </div>
            {bestOf > 1 && (match.status === "live" || match.status === "completed") ? (
              <p className="text-muted-foreground text-[0.7rem] leading-snug">
                {match.status === "live"
                  ? "Tally is games won (not points in a single game)."
                  : "Final games won (best-of)."}
              </p>
            ) : null}
            {match.gameScores != null && match.gameScores.length > 0 ? (
              <ul className="text-muted-foreground space-y-0.5 font-mono text-xs leading-relaxed">
                {match.gameScores.map((g, i) => (
                  <li key={i}>
                    Game {i + 1}:{" "}
                    <span className="text-foreground">
                      {g.a}–{g.b}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {match.status === "completed" ? (
              <p className="text-muted-foreground">
                Winner:{" "}
                <span className="font-medium text-foreground">{winnerName}</span>
              </p>
            ) : null}
          </>
        ) : null}

        {canEnterScores ? (
          <ResultForm
            key={resultFormKey}
            matchId={String(match._id)}
            hint={hint}
            bestOf={bestOf}
            playerAName={aName}
            playerBName={bName}
            existingGameScores={match.gameScores ?? null}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
