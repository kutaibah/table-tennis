import { dbConnect } from "@/lib/db";
import MatchModel from "@/models/Match";
import TournamentModel from "@/models/Tournament";
import {
  parseGameScoresText,
  resolveScoresFromGameLines,
} from "@/lib/tournament/gameLines";
import {
  getFormatForRound,
  type RoundMatchFormat,
} from "@/lib/tournament/matchFormat";
import { resultSchema } from "@/lib/tournament/validations";

export type AdvanceResult =
  | { ok: true; tournamentId: string; matchFinished: boolean }
  | { ok: false; error: string };

export async function advanceWinner(input: {
  matchId: string;
  gameScoresText: string;
}): Promise<AdvanceResult> {
  await dbConnect();
  const parsed = resultSchema.safeParse({
    matchId: input.matchId,
    gameScoresText: input.gameScoresText,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { matchId, gameScoresText } = parsed.data;

  const match = await MatchModel.findById(matchId);
  if (!match) {
    return { ok: false, error: "Match not found." };
  }

  if (match.status === "completed") {
    return { ok: false, error: "This match is already completed." };
  }

  if (match.status !== "pending" && match.status !== "live") {
    return { ok: false, error: "This match cannot accept scores right now." };
  }

  if (!match.playerAId || !match.playerBId) {
    return {
      ok: false,
      error: "Both players must be present before entering a result.",
    };
  }

  const tournament = await TournamentModel.findById(match.tournamentId);
  if (!tournament) {
    return { ok: false, error: "Tournament not found." };
  }

  const linesParsed = parseGameScoresText(gameScoresText);
  if (!linesParsed.ok) {
    return { ok: false, error: linesParsed.error };
  }

  const fmt = getFormatForRound(
    {
      playerCount: tournament.playerCount as number,
      bestOf: tournament.bestOf,
      winMarginThreshold: tournament.winMarginThreshold,
      roundFormats: tournament.roundFormats as RoundMatchFormat[] | undefined,
    },
    match.round,
  );

  const resolved = resolveScoresFromGameLines({
    bestOf: fmt.bestOf,
    winMarginThreshold: fmt.winMarginThreshold,
    games: linesParsed.games,
    allowIncomplete: fmt.bestOf > 1,
  });
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  const { matchComplete, scores } = resolved;
  const { playerAScore, playerBScore, gameScores } = scores;

  if (!matchComplete) {
    match.playerAScore = playerAScore;
    match.playerBScore = playerBScore;
    match.set("gameScores", gameScores);
    match.set("winnerPlayerId", null);
    match.status = "live";
    await match.save();

    if (tournament.status === "drawn") {
      tournament.status = "in_progress";
      await tournament.save();
    }

    return {
      ok: true,
      tournamentId: String(match.tournamentId),
      matchFinished: false,
    };
  }

  const winnerId =
    playerAScore > playerBScore ? match.playerAId : match.playerBId;

  match.playerAScore = playerAScore;
  match.playerBScore = playerBScore;
  match.set("gameScores", gameScores);
  match.winnerPlayerId = winnerId;
  match.status = "completed";
  await match.save();

  if (tournament.status === "drawn") {
    tournament.status = "in_progress";
    await tournament.save();
  }

  if (match.nextMatchId && match.nextMatchSlot) {
    const parent = await MatchModel.findById(match.nextMatchId);
    if (!parent) {
      return { ok: false, error: "Next round match not found." };
    }
    if (match.nextMatchSlot === "A") {
      parent.playerAId = winnerId;
    } else {
      parent.playerBId = winnerId;
    }
    await parent.save();
  } else {
    tournament.status = "completed";
    tournament.championPlayerId = winnerId;
    await tournament.save();
  }

  return {
    ok: true,
    tournamentId: String(match.tournamentId),
    matchFinished: true,
  };
}
