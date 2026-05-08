import type { PlayerMap } from "@/lib/tournament/bracketDisplay";
import {
  displayName,
  formatGameScoresLines,
  roundColumnTitle,
} from "@/lib/tournament/bracketDisplay";

export type LiveFeedItem =
  | {
      kind: "complete";
      matchId: string;
      matchNumber: number;
      roundLabel: string;
      winnerName: string;
      loserName: string;
      scoreLine: string;
      gamesDetail: string | null;
      completedAtIso: string;
    }
  | {
      kind: "live";
      matchId: string;
      matchNumber: number;
      roundLabel: string;
      playerAName: string;
      playerBName: string;
      scoreLine: string;
      gamesDetail: string | null;
      updatedAtIso: string;
    };

export type MatchDocForFeed = {
  _id: unknown;
  round: number;
  matchNumber: number;
  playerAId?: unknown;
  playerBId?: unknown;
  playerAScore?: number | null;
  playerBScore?: number | null;
  gameScores?: { a: number; b: number }[] | null;
  winnerPlayerId?: unknown;
  status: string;
  updatedAt?: Date | string | null;
};

function feedItemUpdatedMs(item: LiveFeedItem): number {
  const iso =
    item.kind === "live" ? item.updatedAtIso : item.completedAtIso;
  return +new Date(iso);
}

export function buildLiveFeedItems(
  matchDocs: MatchDocForFeed[],
  playerMap: PlayerMap,
  totalRounds: number,
  limit = 24,
): LiveFeedItem[] {
  const liveDocs = matchDocs.filter((m) => m.status === "live");
  const completedDocs = matchDocs.filter((m) => m.status === "completed");

  const liveItems: LiveFeedItem[] = liveDocs.map((m) => {
    const roundLabel = roundColumnTitle(m.round, totalRounds);
    const playerAName = displayName(playerMap, m.playerAId);
    const playerBName = displayName(playerMap, m.playerBId);
    const scoreLine =
      m.playerAScore != null && m.playerBScore != null
        ? `${m.playerAScore}–${m.playerBScore}`
        : "—";
    const lines = formatGameScoresLines(m.gameScores ?? undefined);
    const gamesDetail =
      lines.length > 0 && (m.gameScores?.length ?? 0) > 0 ? lines : null;
    const updatedAtIso =
      m.updatedAt != null
        ? new Date(m.updatedAt).toISOString()
        : new Date().toISOString();

    return {
      kind: "live",
      matchId: String(m._id),
      matchNumber: m.matchNumber,
      roundLabel,
      playerAName,
      playerBName,
      scoreLine,
      gamesDetail,
      updatedAtIso,
    };
  });

  const completeItems: LiveFeedItem[] = completedDocs.map((m) => {
    const winnerId =
      m.winnerPlayerId != null ? String(m.winnerPlayerId) : "";
    const aId = m.playerAId != null ? String(m.playerAId) : "";
    const bId = m.playerBId != null ? String(m.playerBId) : "";
    const loserId = winnerId && winnerId === aId ? bId : aId;

    const winnerName = displayName(playerMap, m.winnerPlayerId);
    const loserName = displayName(playerMap, loserId || null);
    const roundLabel = roundColumnTitle(m.round, totalRounds);
    const scoreLine =
      m.playerAScore != null && m.playerBScore != null
        ? `${m.playerAScore}–${m.playerBScore}`
        : "—";
    const lines = formatGameScoresLines(m.gameScores ?? undefined);
    const gamesDetail =
      lines.length > 0 && (m.gameScores?.length ?? 0) > 0 ? lines : null;

    const completedAtIso =
      m.updatedAt != null
        ? new Date(m.updatedAt).toISOString()
        : new Date().toISOString();

    return {
      kind: "complete",
      matchId: String(m._id),
      matchNumber: m.matchNumber,
      roundLabel,
      winnerName,
      loserName,
      scoreLine,
      gamesDetail,
      completedAtIso,
    };
  });

  return [...liveItems, ...completeItems]
    .sort((a, b) => feedItemUpdatedMs(b) - feedItemUpdatedMs(a))
    .slice(0, limit);
}

export function formatFeedTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
