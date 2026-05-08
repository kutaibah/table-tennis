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
    return bestOf === 1
      ? "Scores cannot be equal."
      : "Games won are tied; add the remaining game line(s) until one player reaches the match.";
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
    return `For best-of-${bestOf}, your lines add up to ${a}–${b} games won (A–B). It must be exactly ${gamesToWin}–0, ${gamesToWin}–1, 1–${gamesToWin}, or 0–${gamesToWin}. If someone already had ${gamesToWin} wins, delete any later rows.`;
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
  return `One row per game: points for A, then B (e.g. 11 and 7). Valid games to 11 (win by 2). You can save after each game — the match stays live until someone wins ${gamesToWin} games. Leave unused rows blank.`;
}
