import { cn } from "@/lib/utils";
import {
  displayName,
  formatGameScoresLines,
  roundColumnTitle,
  type BracketMatch,
  type PlayerMap,
} from "@/lib/tournament/bracketDisplay";

export function MatchesTable({
  matches,
  playerMap,
  totalRounds,
}: {
  matches: BracketMatch[];
  playerMap: PlayerMap;
  totalRounds: number;
}) {
  if (!matches.length) {
    return (
      <p className="text-muted-foreground text-sm">No matches yet.</p>
    );
  }

  const rows = [...matches].sort(
    (a, b) => a.round - b.round || a.matchNumber - b.matchNumber,
  );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b text-left">
            <th className="p-3 font-medium">Round</th>
            <th className="p-3 font-medium">#</th>
            <th className="p-3 font-medium">Player A</th>
            <th className="p-3 font-medium">Player B</th>
            <th className="p-3 font-medium">Score</th>
            <th className="p-3 font-medium">Winner</th>
            <th className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const roundLabel = roundColumnTitle(m.round, totalRounds);
            const a = displayName(playerMap, m.playerAId);
            const b = displayName(playerMap, m.playerBId);
            const winner = displayName(playerMap, m.winnerPlayerId);
            const summary =
              m.playerAScore != null && m.playerBScore != null
                ? `${m.playerAScore} – ${m.playerBScore}`
                : "—";

            return (
              <tr
                key={m._id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="text-muted-foreground p-3">{roundLabel}</td>
                <td className="p-3">{m.matchNumber}</td>
                <td className="p-3">{a}</td>
                <td className="p-3">{b}</td>
                <td className="font-mono p-3">
                  <div>{summary}</div>
                  {m.gameScores != null && m.gameScores.length > 1 ? (
                    <div className="text-muted-foreground mt-0.5 text-xs leading-snug">
                      {formatGameScoresLines(m.gameScores)}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">{m.status === "completed" ? winner : "—"}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      m.status === "completed"
                        ? "bg-green-500/15 text-green-800 dark:text-green-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
