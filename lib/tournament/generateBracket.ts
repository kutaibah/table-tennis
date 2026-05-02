import mongoose from "mongoose";

import type { PlayerDocument } from "@/models/Player";
import MatchModel from "@/models/Match";

export type BracketMatchInsert = {
  _id: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  round: number;
  matchNumber: number;
  playerAId?: mongoose.Types.ObjectId;
  playerBId?: mongoose.Types.ObjectId;
  playerAScore?: number;
  playerBScore?: number;
  winnerPlayerId?: mongoose.Types.ObjectId;
  nextMatchId?: mongoose.Types.ObjectId;
  nextMatchSlot?: "A" | "B";
  status: "pending";
};

function shuffle<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build full knockout bracket. Round 1 is round=1. Each match has nextMatchId/nextMatchSlot.
 */
export function generateBracket(
  players: PlayerDocument[],
  tournamentId: mongoose.Types.ObjectId,
): BracketMatchInsert[] {
  const n = players.length;
  if (n < 2 || (n & (n - 1)) !== 0) {
    throw new Error("Player count must be a power of 2");
  }

  const totalRounds = Math.log2(n);
  const shuffled = shuffle(players);

  // ids[roundIndex][matchIndex] where roundIndex 0 = first round
  const ids: mongoose.Types.ObjectId[][] = [];
  for (let r = 0; r < totalRounds; r++) {
    const matchesInRound = n / 2 ** (r + 1);
    ids[r] = [];
    for (let m = 0; m < matchesInRound; m++) {
      ids[r][m] = new mongoose.Types.ObjectId();
    }
  }

  const docs: BracketMatchInsert[] = [];

  for (let r = 0; r < totalRounds; r++) {
    const matchesInRound = ids[r].length;
    for (let m = 0; m < matchesInRound; m++) {
      const _id = ids[r][m];
      let nextMatchId: mongoose.Types.ObjectId | undefined;
      let nextMatchSlot: "A" | "B" | undefined;

      if (r < totalRounds - 1) {
        const parentIndex = Math.floor(m / 2);
        nextMatchId = ids[r + 1][parentIndex];
        nextMatchSlot = m % 2 === 0 ? "A" : "B";
      }

      let playerAId: mongoose.Types.ObjectId | undefined;
      let playerBId: mongoose.Types.ObjectId | undefined;

      if (r === 0) {
        const p1 = shuffled[m * 2];
        const p2 = shuffled[m * 2 + 1];
        playerAId = p1._id;
        playerBId = p2._id;
      }

      docs.push({
        _id,
        tournamentId,
        round: r + 1,
        matchNumber: m + 1,
        playerAId,
        playerBId,
        playerAScore: undefined,
        playerBScore: undefined,
        winnerPlayerId: undefined,
        nextMatchId,
        nextMatchSlot,
        status: "pending",
      });
    }
  }

  return docs;
}

export async function insertBracketMatches(docs: BracketMatchInsert[]) {
  await MatchModel.insertMany(docs);
}
