import type { PlayerMap } from "@/lib/tournament/bracketDisplay";
import {
  buildLiveFeedItems,
  type MatchDocForFeed,
} from "@/lib/tournament/liveFeed";
import {
  formatsByRoundRecord,
  normalizeRoundFormats,
  summarizeRoundFormats,
  totalRoundsFromPlayerCount,
  type RoundMatchFormat,
} from "@/lib/tournament/matchFormat";
import { toBracketMatches } from "@/lib/tournament/serializeBracket";
import { dbConnect } from "@/lib/db";
import MatchModel from "@/models/Match";
import PlayerModel from "@/models/Player";
import TournamentModel from "@/models/Tournament";

export async function loadTournamentBundle(id: string) {
  await dbConnect();
  const tournament = await TournamentModel.findById(id).lean();
  if (!tournament) return null;

  const players = await PlayerModel.find({ tournamentId: tournament._id })
    .sort({ createdAt: 1 })
    .lean();

  const matchDocs = await MatchModel.find({ tournamentId: tournament._id })
    .sort({ round: 1, matchNumber: 1 })
    .lean();

  const bracketMatches = toBracketMatches(
    matchDocs.map((m) => ({
      _id: m._id,
      round: m.round,
      matchNumber: m.matchNumber,
      playerAId: m.playerAId,
      playerBId: m.playerBId,
      playerAScore: m.playerAScore,
      playerBScore: m.playerBScore,
      gameScores: m.gameScores as { a: number; b: number }[] | undefined,
      winnerPlayerId: m.winnerPlayerId,
      status: m.status as "pending" | "live" | "completed",
    })),
  );

  const playerMap: PlayerMap = new Map(
    players.map((p) => [
      String(p._id),
      { name: p.name, nickname: p.nickname ?? undefined },
    ]),
  );

  const totalRounds = totalRoundsFromPlayerCount(tournament.playerCount as number);

  const roundFormats: RoundMatchFormat[] = normalizeRoundFormats({
    playerCount: tournament.playerCount as number,
    bestOf: tournament.bestOf,
    winMarginThreshold: tournament.winMarginThreshold,
    roundFormats: tournament.roundFormats as RoundMatchFormat[] | undefined,
  });

  const formatByRound = formatsByRoundRecord(roundFormats);
  const formatsSummary = summarizeRoundFormats(roundFormats);

  const liveFeed = buildLiveFeedItems(
    matchDocs as MatchDocForFeed[],
    playerMap,
    totalRounds,
  );

  const champion =
    tournament.championPlayerId != null
      ? players.find(
          (p) => String(p._id) === String(tournament.championPlayerId),
        )
      : undefined;

  return {
    tournament,
    players,
    bracketMatches,
    playerMap,
    totalRounds,
    roundFormats,
    formatByRound,
    formatsSummary,
    liveFeed,
    championName:
      champion != null
        ? champion.nickname
          ? `${champion.name} (${champion.nickname})`
          : champion.name
        : undefined,
  };
}
