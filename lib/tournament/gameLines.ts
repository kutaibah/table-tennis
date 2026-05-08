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

export type ResolveScoresResult =
  | { ok: false; error: string }
  | { ok: true; matchComplete: boolean; scores: ResolvedMatchScores };

/**
 * Validates per-game point lines. For best-of > 1, set `allowIncomplete` to accept
 * matches where neither player has reached games-to-win yet (e.g. 1–0, 1–1).
 */
export function resolveScoresFromGameLines(input: {
  bestOf: number;
  winMarginThreshold: number;
  games: GamePair[];
  /** When true (multi-game only), allow partial tallies until the match is decided. */
  allowIncomplete?: boolean;
}): ResolveScoresResult {
  const { games } = input;
  const bestOf = input.bestOf ?? 1;
  const winMargin = Math.max(1, Math.floor(input.winMarginThreshold ?? 1));
  const allowIncomplete = input.allowIncomplete === true;

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
      matchComplete: true,
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

  const gamesToWin = Math.ceil(bestOf / 2);

  if (games.length > bestOf) {
    return {
      ok: false,
      error: `Best-of-${bestOf} uses at most ${bestOf} games. You entered ${games.length} rows — remove rows after the match ended.`,
    };
  }

  if (gamesA > gamesToWin || gamesB > gamesToWin) {
    return {
      ok: false,
      error: `Best-of-${bestOf} ends when a player wins ${gamesToWin} games. Your rows give ${gamesA}–${gamesB} game wins (A–B); remove extra rows once the match is decided.`,
    };
  }

  const decided = gamesA >= gamesToWin || gamesB >= gamesToWin;

  if (decided) {
    const ruleError = validateMatchScores({
      bestOf,
      winMarginThreshold: winMargin,
      playerAScore: gamesA,
      playerBScore: gamesB,
    });
    if (ruleError) {
      return { ok: false, error: ruleError };
    }
    return {
      ok: true,
      matchComplete: true,
      scores: {
        playerAScore: gamesA,
        playerBScore: gamesB,
        gameScores: games.map((g) => ({ a: g.a, b: g.b })),
      },
    };
  }

  if (!allowIncomplete) {
    return {
      ok: false,
      error: `Match not finished (${gamesA}–${gamesB} games won, A–B). The winner needs ${gamesToWin} games for best-of-${bestOf}.`,
    };
  }

  return {
    ok: true,
    matchComplete: false,
    scores: {
      playerAScore: gamesA,
      playerBScore: gamesB,
      gameScores: games.map((g) => ({ a: g.a, b: g.b })),
    },
  };
}
