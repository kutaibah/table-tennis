import type { BracketMatch } from "@/lib/tournament/bracketDisplay";

/** Normalize Mongo lean match docs for bracket UI + client children. */
export function toBracketMatches(
  docs: {
    _id: unknown;
    round: number;
    matchNumber: number;
    playerAId?: unknown;
    playerBId?: unknown;
    playerAScore?: number | null;
    playerBScore?: number | null;
    gameScores?: { a?: number; b?: number }[] | null;
    winnerPlayerId?: unknown;
    status?: string;
  }[],
): BracketMatch[] {
  return docs.map((m) => ({
    _id: String(m._id),
    round: m.round,
    matchNumber: m.matchNumber,
    playerAId: m.playerAId != null ? String(m.playerAId) : undefined,
    playerBId: m.playerBId != null ? String(m.playerBId) : undefined,
    playerAScore: m.playerAScore ?? undefined,
    playerBScore: m.playerBScore ?? undefined,
    gameScores: normalizeGameScores(m.gameScores),
    winnerPlayerId:
      m.winnerPlayerId != null ? String(m.winnerPlayerId) : undefined,
    status: normalizeMatchStatus(m.status),
  }));
}

function normalizeMatchStatus(
  s: string | undefined,
): "pending" | "live" | "completed" {
  if (s === "live" || s === "completed") return s;
  return "pending";
}

function normalizeGameScores(
  raw: { a?: number; b?: number }[] | null | undefined,
): { a: number; b: number }[] | undefined {
  if (raw == null || !Array.isArray(raw) || raw.length === 0) return undefined;
  const out: { a: number; b: number }[] = [];
  for (const row of raw) {
    if (
      row?.a == null ||
      row?.b == null ||
      !Number.isFinite(row.a) ||
      !Number.isFinite(row.b)
    ) {
      continue;
    }
    out.push({ a: row.a, b: row.b });
  }
  return out.length ? out : undefined;
}
