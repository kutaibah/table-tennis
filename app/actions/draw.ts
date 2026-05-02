"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthAction } from "@/lib/auth/guard";
import { dbConnect } from "@/lib/db";
import {
  generateBracket,
  insertBracketMatches,
} from "@/lib/tournament/generateBracket";
import MatchModel from "@/models/Match";
import PlayerModel from "@/models/Player";
import TournamentModel from "@/models/Tournament";

import type { ActionState } from "./tournaments";

const drawSchema = z.object({
  tournamentId: z.string().min(1),
});

export async function generateDrawAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAuthAction();
  if (auth) return auth;

  let tid: string | undefined;
  try {
    await dbConnect();
    const raw = Object.fromEntries(formData.entries());
    const parsed = drawSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Invalid request." };
    }
    tid = parsed.data.tournamentId;

    const tournament = await TournamentModel.findById(tid);
    if (!tournament) return { error: "Tournament not found." };

    if (
      tournament.status === "drawn" ||
      tournament.status === "in_progress" ||
      tournament.status === "completed"
    ) {
      return { error: "Draw has already been generated for this tournament." };
    }

    const players = await PlayerModel.find({
      tournamentId: tournament._id,
    }).sort({ createdAt: 1 });

    if (players.length !== tournament.playerCount) {
      return {
        error: `Add all ${tournament.playerCount} players before generating the draw.`,
      };
    }

    const existing = await MatchModel.countDocuments({
      tournamentId: tournament._id,
    });
    if (existing > 0) {
      return { error: "Bracket already exists for this tournament." };
    }

    const docs = generateBracket(players, tournament._id);
    await insertBracketMatches(docs);

    tournament.status = "drawn";
    await tournament.save();
  } catch (e) {
    console.error(e);
    return { error: "Could not generate draw." };
  }

  if (tid) {
    revalidatePath(`/admin/tournaments/${tid}`);
    revalidatePath(`/tournaments/${tid}`);
    revalidatePath("/admin/tournaments");
    revalidatePath("/");
  }
  return { success: "Draw generated." };
}
