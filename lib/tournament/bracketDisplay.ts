export type GameScoreLine = { a: number; b: number };

export type BracketMatch = {
  _id: string;
  round: number;
  matchNumber: number;
  playerAId?: string | null;
  playerBId?: string | null;
  playerAScore?: number | null;
  playerBScore?: number | null;
  /** Points per game (A vs B); omitted on older records. */
  gameScores?: GameScoreLine[] | null;
  winnerPlayerId?: string | null;
  status: "pending" | "live" | "completed";
};

export type PlayerMap = Map<string, { name: string; nickname?: string }>;

export function roundColumnTitle(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi Final";
  if (fromEnd === 2) return "Quarter Final";
  return `Round ${round}`;
}

export function formatGameScoresLines(games: GameScoreLine[] | null | undefined): string {
  if (games == null || games.length === 0) return "";
  return games.map((g) => `${g.a}–${g.b}`).join(" · ");
}

export function displayName(map: PlayerMap, id: unknown): string {
  if (id == null || id === "") return "—";
  const key = String(id);
  const p = map.get(key);
  if (!p) return "—";
  return p.nickname ? `${p.name} (${p.nickname})` : p.name;
}
