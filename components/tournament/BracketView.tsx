import type { BracketMatch } from "@/lib/tournament/bracketDisplay";
import { scoreEntryHint } from "@/lib/tournament/scoreRules";

import { MatchCard } from "@/components/tournament/MatchCard";
import { roundColumnTitle, type PlayerMap } from "@/lib/tournament/bracketDisplay";

export function BracketView({
  matches,
  playerMap,
  totalRounds,
  showResultForms,
  bestOf = 1,
  winMarginThreshold = 1,
}: {
  matches: BracketMatch[];
  playerMap: PlayerMap;
  totalRounds: number;
  showResultForms?: boolean;
  bestOf?: number;
  winMarginThreshold?: number;
}) {
  const byRound = new Map<number, BracketMatch[]>();
  for (const m of matches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }
  for (const [, list] of byRound) {
    list.sort((a, b) => a.matchNumber - b.matchNumber);
  }

  const rounds = [...byRound.keys()].sort((a, b) => a - b);

  const scoreHint = showResultForms
    ? scoreEntryHint(bestOf, winMarginThreshold)
    : undefined;

  if (!rounds.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No bracket yet. Generate the draw after adding all players.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
      {rounds.map((r) => (
        <section key={r} className="min-w-0 flex-1 space-y-3">
          <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            {roundColumnTitle(r, totalRounds)}
          </h3>
          <div className="flex flex-col gap-3">
            {(byRound.get(r) ?? []).map((m) => (
              <MatchCard
                key={String(m._id)}
                match={m}
                playerMap={playerMap}
                totalRounds={totalRounds}
                showResultForm={showResultForms}
                bestOf={bestOf}
                scoreHint={scoreHint}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
