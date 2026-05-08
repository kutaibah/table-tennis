import type { BestOf } from "@/lib/tournament/constants";
import { BEST_OF_OPTIONS } from "@/lib/tournament/constants";
import { roundColumnTitle } from "@/lib/tournament/bracketDisplay";

export type RoundMatchFormat = {
  round: number;
  bestOf: BestOf;
  winMarginThreshold: number;
};

export type TournamentFormatSource = {
  playerCount: number;
  bestOf?: number | null;
  winMarginThreshold?: number | null;
  roundFormats?: RoundMatchFormat[] | null | undefined;
};

export function totalRoundsFromPlayerCount(playerCount: number): number {
  if (playerCount < 2) return 1;
  return Math.round(Math.log2(playerCount));
}

/**
 * Normalize one stored subdocument / JSON row so strict checks (e.g. Mongoose or
 * stringly-typed JSON) do not force a fallback to legacy single bestOf for every round.
 */
function coerceRoundFormatEntry(x: unknown): RoundMatchFormat | null {
  if (x == null || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const round = Number(o.round);
  const bestOfN = Number(o.bestOf);
  const w = Number(o.winMarginThreshold ?? 1);
  if (!Number.isInteger(round) || round < 1) return null;
  if (!Number.isFinite(bestOfN)) return null;
  if (!(BEST_OF_OPTIONS as readonly number[]).includes(bestOfN as BestOf)) {
    return null;
  }
  const winMarginThreshold = Math.max(1, Math.min(99, Math.floor(w)));
  return {
    round,
    bestOf: bestOfN as BestOf,
    winMarginThreshold,
  };
}

function uniformFormatsFromLegacy(
  playerCount: number,
  bestOf: number | null | undefined,
  winMarginThreshold: number | null | undefined,
): RoundMatchFormat[] {
  const total = totalRoundsFromPlayerCount(Number(playerCount));
  const legacyBo = Number(bestOf ?? 1);
  const b = legacyBo as BestOf;
  const safeB = (BEST_OF_OPTIONS as readonly number[]).includes(b) ? b : 1;
  const w = Math.max(1, Math.min(99, Math.floor(winMarginThreshold ?? 1)));
  return Array.from({ length: total }, (_, i) => ({
    round: i + 1,
    bestOf: safeB,
    winMarginThreshold: w,
  }));
}

/** Same bestOf / margin for every bracket round (create form defaults). */
export function uniformRoundFormats(
  playerCount: number,
  bestOf: number,
  winMarginThreshold: number,
): RoundMatchFormat[] {
  return uniformFormatsFromLegacy(playerCount, bestOf, winMarginThreshold);
}

/** Canonical list for bracket + editor; merges DB rows by round with legacy fill. */
export function normalizeRoundFormats(
  t: TournamentFormatSource,
): RoundMatchFormat[] {
  const total = totalRoundsFromPlayerCount(Number(t.playerCount));
  const legacyLineup = uniformFormatsFromLegacy(
    Number(t.playerCount),
    t.bestOf,
    t.winMarginThreshold,
  );

  const raw = t.roundFormats;
  if (!Array.isArray(raw) || raw.length === 0) {
    return legacyLineup;
  }

  const coerced = raw
    .map(coerceRoundFormatEntry)
    .filter((x): x is RoundMatchFormat => x != null);
  if (coerced.length === 0) {
    return legacyLineup;
  }

  const byRound = new Map<number, RoundMatchFormat>();
  for (const x of coerced) {
    if (x.round >= 1 && x.round <= total) {
      byRound.set(x.round, x);
    }
  }
  if (byRound.size === 0) {
    return legacyLineup;
  }

  return Array.from({ length: total }, (_, i) => {
    const r = i + 1;
    const hit = byRound.get(r);
    if (hit) {
      return { ...hit, round: r };
    }
    const fallback = legacyLineup[i];
    return fallback
      ? { ...fallback, round: r }
      : { round: r, bestOf: 1 as BestOf, winMarginThreshold: 1 };
  });
}

export function getFormatForRound(
  t: TournamentFormatSource,
  round: number,
): { bestOf: number; winMarginThreshold: number } {
  const list = normalizeRoundFormats(t);
  const f = list.find((x) => x.round === round);
  if (f) {
    return { bestOf: f.bestOf, winMarginThreshold: f.winMarginThreshold };
  }
  return { bestOf: 1, winMarginThreshold: 1 };
}

export function formatsByRoundRecord(
  formats: RoundMatchFormat[],
): Record<number, { bestOf: number; winMarginThreshold: number }> {
  const out: Record<number, { bestOf: number; winMarginThreshold: number }> =
    {};
  for (const f of formats) {
    out[f.round] = {
      bestOf: f.bestOf,
      winMarginThreshold: f.winMarginThreshold,
    };
  }
  return out;
}

export function summarizeRoundFormats(formats: RoundMatchFormat[]): string {
  if (formats.length === 0) return "";
  const total = formats.length;
  const first = formats[0];
  if (!first) return "";
  const uniform = formats.every(
    (f) =>
      f.bestOf === first.bestOf &&
      f.winMarginThreshold === first.winMarginThreshold,
  );
  if (uniform) {
    return first.bestOf === 1
      ? `Every round: single score · min lead ${first.winMarginThreshold}`
      : `Every round: best-of-${first.bestOf}`;
  }
  return formats
    .map((f) => {
      const label = roundColumnTitle(f.round, total);
      return f.bestOf === 1
        ? `${label} 1-game (±${f.winMarginThreshold})`
        : `${label} Bo${f.bestOf}`;
    })
    .join(" → ");
}

export function buildRoundFormatsForSave(input: {
  playerCount: number;
  bestOf: number;
  winMarginThreshold: number;
  roundFormatsJson?: string | null | undefined;
}):
  | { ok: true; formats: RoundMatchFormat[] }
  | { ok: false; error: string } {
  const total = totalRoundsFromPlayerCount(input.playerCount);
  if (total < 1) {
    return { ok: false, error: "Invalid player count for bracket." };
  }

  const json = input.roundFormatsJson?.trim();
  if (json && json.length > 0) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json) as unknown;
    } catch {
      return { ok: false, error: "Invalid round formats JSON." };
    }
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "Round formats must be a JSON array." };
    }
    if (parsed.length !== total) {
      return {
        ok: false,
        error: `Need exactly ${total} round format(s) for ${input.playerCount} players.`,
      };
    }

    const rows: RoundMatchFormat[] = [];
    const seen = new Set<number>();

    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i] as Record<string, unknown>;
      const round = Number(row?.round);
      const bestOf = Number(row?.bestOf);
      const winMarginThreshold = Number(row?.winMarginThreshold ?? 1);

      if (!Number.isInteger(round) || round < 1 || round > total) {
        return { ok: false, error: `Invalid round number in row ${i + 1}.` };
      }
      if (seen.has(round)) {
        return { ok: false, error: `Duplicate round ${round} in formats.` };
      }
      seen.add(round);

      if (!(BEST_OF_OPTIONS as readonly number[]).includes(bestOf)) {
        return {
          ok: false,
          error: `Round ${round}: games per match must be 1, 3, 5, or 7.`,
        };
      }

      const w = Math.floor(winMarginThreshold);
      if (!Number.isFinite(w) || w < 1 || w > 99) {
        return {
          ok: false,
          error: `Round ${round}: score threshold must be 1–99.`,
        };
      }

      rows.push({
        round,
        bestOf: bestOf as BestOf,
        winMarginThreshold: w,
      });
    }

    rows.sort((a, b) => a.round - b.round);
    for (let r = 1; r <= total; r++) {
      if (rows[r - 1]?.round !== r) {
        return {
          ok: false,
          error: `Missing format for round ${r}.`,
        };
      }
    }

    return { ok: true, formats: rows };
  }

  const b = (BEST_OF_OPTIONS as readonly number[]).includes(input.bestOf)
    ? input.bestOf
    : 1;
  const w = Math.max(1, Math.min(99, Math.floor(input.winMarginThreshold)));

  return {
    ok: true,
    formats: Array.from({ length: total }, (_, i) => ({
      round: i + 1,
      bestOf: b as BestOf,
      winMarginThreshold: w,
    })),
  };
}
