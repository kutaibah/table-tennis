import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResultForm } from "@/components/tournament/ResultForm";
import {
  displayName,
  formatGameScoresLines,
  roundColumnTitle,
  type BracketMatch,
  type PlayerMap,
} from "@/lib/tournament/bracketDisplay";

export function MatchCard({
  match,
  playerMap,
  totalRounds,
  showResultForm,
  bestOf,
  scoreHint,
}: {
  match: BracketMatch;
  playerMap: PlayerMap;
  totalRounds: number;
  showResultForm?: boolean;
  bestOf?: number;
  scoreHint?: string;
}) {
  const titleRound = roundColumnTitle(match.round, totalRounds);
  const aName = displayName(playerMap, match.playerAId);
  const bName = displayName(playerMap, match.playerBId);
  const waitingA = !match.playerAId;
  const waitingB = !match.playerBId;
  const winnerName = displayName(playerMap, match.winnerPlayerId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {titleRound} — Match {match.matchNumber}
          {bestOf != null && bestOf > 1 ? (
            <span className="text-muted-foreground font-normal">
              {" "}
              · Bo{bestOf}
            </span>
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
            {match.gameScores != null && match.gameScores.length > 1 ? (
              <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                {formatGameScoresLines(match.gameScores)}
              </p>
            ) : null}
            {match.status === "completed" ? (
              <p className="text-muted-foreground">
                Winner:{" "}
                <span className="font-medium text-foreground">{winnerName}</span>
              </p>
            ) : null}
          </>
        ) : null}

        {showResultForm &&
        match.status === "pending" &&
        !waitingA &&
        !waitingB ? (
          <ResultForm
            matchId={String(match._id)}
            hint={scoreHint}
            bestOf={bestOf ?? 1}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
