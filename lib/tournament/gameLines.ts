import { validateMatchScores } from "@/lib/tournament/scoreRules";

export type GamePair = { a: number; b: number };

/** Standard game to 11, win by 2; deuce from 10–10 onward. */
export function validTableTennisGame(a: number, b: number): boolean {
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    a < 0 ||
    b < 0 ||
    a === b
  ) {
    return false;
  }
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (lo < 10) {
    return hi === 11 && hi > lo;
  }
  return hi - lo === 2;
}

export function parseGameScoresText(raw: string):
  | { ok: true; games: GamePair[] }
  | { ok: false; error: string } {
  const lines = raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { ok: false, error: "Add at least one line (two scores per line)." };
  }

  const games: GamePair[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length !== 2) {
      return {
        ok: false,
        error: `Line ${i + 1}: use two numbers (e.g. "11 7"), not "${line}".`,
      };
    }
    const av = Number(parts[0]);
    const bv = Number(parts[1]);
    if (!Number.isInteger(av) || !Number.isInteger(bv)) {
      return {
        ok: false,
        error: `Line ${i + 1}: scores must be whole numbers.`,
      };
    }
    games.push({ a: av, b: bv });
  }
  return { ok: true, games };
}

export type ResolvedMatchScores = {
  playerAScore: number;
  playerBScore: number;
  gameScores: GamePair[];
};

export function resolveScoresFromGameLines(input: {
  bestOf: number;
  winMarginThreshold: number;
  games: GamePair[];
}): { ok: true; scores: ResolvedMatchScores } | { ok: false; error: string } {
  const { games } = input;
  const bestOf = input.bestOf ?? 1;
  const winMargin = Math.max(1, Math.floor(input.winMarginThreshold ?? 1));

  for (let i = 0; i < games.length; i++) {
    const g = games[i]!;
    if (!validTableTennisGame(g.a, g.b)) {
      return {
        ok: false,
        error: `Game ${i + 1} (${g.a}–${g.b}): invalid table tennis game (to 11, win by 2; from 10–10, win by 2).`,
      };
    }
  }

  if (bestOf === 1) {
    if (games.length !== 1) {
      return {
        ok: false,
        error: "For one game per match, enter exactly one line (e.g. 11 7).",
      };
    }
    const g = games[0]!;
    const margin = Math.abs(g.a - g.b);
    if (margin < winMargin) {
      return {
        ok: false,
        error: `Winner must lead by at least ${winMargin} point(s) (tournament threshold).`,
      };
    }
    return {
      ok: true,
      scores: {
        playerAScore: g.a,
        playerBScore: g.b,
        gameScores: [{ a: g.a, b: g.b }],
      },
    };
  }

  let gamesA = 0;
  let gamesB = 0;
  for (const g of games) {
    if (g.a > g.b) gamesA++;
    else gamesB++;
  }

  const ruleError = validateMatchScores({
    bestOf,
    winMarginThreshold: winMargin,
    playerAScore: gamesA,
    playerBScore: gamesB,
  });
  if (ruleError) {
    return {
      ok: false,
      error: `${ruleError} Check your per-game lines match the match result.`,
    };
  }

  return {
    ok: true,
    scores: {
      playerAScore: gamesA,
      playerBScore: gamesB,
      gameScores: games.map((g) => ({ a: g.a, b: g.b })),
    },
  };
}
