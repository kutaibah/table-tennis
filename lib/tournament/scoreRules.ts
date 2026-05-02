export function validateMatchScores(input: {
  bestOf: number;
  winMarginThreshold: number;
  playerAScore: number;
  playerBScore: number;
}): string | null {
  const { playerAScore: a, playerBScore: b } = input;
  const margin = Math.abs(a - b);
  const bestOf = input.bestOf ?? 1;
  const winMargin = Math.max(1, Math.floor(input.winMarginThreshold ?? 1));

  if (a === b) {
    return "Scores cannot be equal.";
  }

  if (bestOf === 1) {
    if (margin < winMargin) {
      return `Winner must lead by at least ${winMargin} point(s) (score threshold).`;
    }
    return null;
  }

  const gamesToWin = Math.ceil(bestOf / 2);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);

  if (hi !== gamesToWin || lo >= gamesToWin) {
    return `For best-of-${bestOf}, enter games won: winner must have exactly ${gamesToWin} and the opponent fewer (e.g. ${gamesToWin}-0 … ${gamesToWin}-${gamesToWin - 1}).`;
  }

  return null;
}

export function scoreEntryHint(bestOf: number, winMarginThreshold: number): string {
  const best = bestOf ?? 1;
  const margin = Math.max(1, Math.floor(winMarginThreshold ?? 1));

  if (best === 1) {
    return `One line: Player A points, then Player B (e.g. 11 7). Valid game to 11, win by 2; winner must lead by at least ${margin} (threshold).`;
  }

  const gamesToWin = Math.ceil(best / 2);
  return `One line per game, two numbers each (e.g. 11 7 / 8 11 / 12 10). Each line must be a valid game to 11 (win by 2). First to ${gamesToWin} games wins the match.`;
}
