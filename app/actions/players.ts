"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthAction } from "@/lib/auth/guard";
import { dbConnect } from "@/lib/db";
import { parseFormData, playerCreateSchema } from "@/lib/tournament/validations";
import PlayerModel from "@/models/Player";
import TournamentModel from "@/models/Tournament";

import type { ActionState } from "./tournaments";

export async function addPlayerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAuthAction();
  if (auth) return auth;

  try {
    await dbConnect();
    const data = parseFormData(playerCreateSchema, formData);

    const tournament = await TournamentModel.findById(data.tournamentId);
    if (!tournament) return { error: "Tournament not found." };

    const lockedStatuses = ["drawn", "in_progress", "completed"] as const;
    if (lockedStatuses.includes(tournament.status as (typeof lockedStatuses)[number])) {
      return { error: "Players are locked after the draw is generated." };
    }

    if (tournament.status !== "draft" && tournament.status !== "players_added") {
      return { error: "Cannot add players in the current state." };
    }

    const count = await PlayerModel.countDocuments({
      tournamentId: tournament._id,
    });
    if (count >= tournament.playerCount) {
      return { error: `Roster is full (${tournament.playerCount} players).` };
    }

    await PlayerModel.create({
      tournamentId: tournament._id,
      name: data.name,
      nickname: data.nickname,
      seed: data.seed,
    });

    const newCount = count + 1;
    if (newCount >= 1 && tournament.status === "draft") {
      tournament.status = "players_added";
      await tournament.save();
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: e.issues[0]?.message ?? "Validation failed" };
    }
    console.error(e);
    return { error: "Could not add player." };
  }

  const id = formData.get("tournamentId");
  if (typeof id === "string") {
    revalidatePath(`/admin/tournaments/${id}`);
    revalidatePath(`/tournaments/${id}`);
    revalidatePath("/admin/tournaments");
    revalidatePath("/");
  }
  return {};
}

export async function removePlayerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tournamentId = formData.get("tournamentId");
  const playerId = formData.get("playerId");
  if (typeof tournamentId !== "string" || typeof playerId !== "string") {
    return { error: "Invalid request." };
  }

  const auth = await requireAuthAction();
  if (auth) return auth;

  try {
    await dbConnect();
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) return { error: "Tournament not found." };

    const lockedStatuses = ["drawn", "in_progress", "completed"] as const;
    if (lockedStatuses.includes(tournament.status as (typeof lockedStatuses)[number])) {
      return { error: "Players cannot be removed after the draw." };
    }

    await PlayerModel.deleteOne({
      _id: playerId,
      tournamentId: tournament._id,
    });

    const remaining = await PlayerModel.countDocuments({
      tournamentId: tournament._id,
    });
    if (remaining === 0) {
      tournament.status = "draft";
    } else {
      tournament.status = "players_added";
    }
    await tournament.save();
  } catch (e) {
    console.error(e);
    return { error: "Could not remove player." };
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return {};
}
