"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAuthAction } from "@/lib/auth/guard";
import { dbConnect } from "@/lib/db";
import {
  parseFormData,
  tournamentCreateSchema,
  tournamentUpdateSchema,
} from "@/lib/tournament/validations";
import PlayerModel from "@/models/Player";
import MatchModel from "@/models/Match";
import TournamentModel from "@/models/Tournament";

export type ActionState = { error?: string; success?: string };

export async function createTournamentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAuthAction();
  if (auth) return auth;

  let tournamentId: string | undefined;
  try {
    await dbConnect();
    const data = parseFormData(tournamentCreateSchema, formData);

    const startDate =
      data.startDate && data.startDate.length > 0
        ? new Date(data.startDate)
        : undefined;

    const t = await TournamentModel.create({
      name: data.name,
      description: data.description || undefined,
      playerCount: data.playerCount,
      bestOf: data.bestOf,
      winMarginThreshold: data.winMarginThreshold,
      status: "draft",
      startDate,
    });
    tournamentId = String(t._id);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: e.issues[0]?.message ?? "Validation failed" };
    }
    console.error(e);
    return { error: "Could not create tournament." };
  }

  revalidatePath("/");
  revalidatePath("/admin/tournaments");
  if (tournamentId) {
    redirect(`/admin/tournaments/${tournamentId}`);
  }
  return { error: "Could not create tournament." };
}

export async function updateTournamentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAuthAction();
  if (auth) return auth;

  try {
    await dbConnect();
    const data = parseFormData(tournamentUpdateSchema, formData);

    const t = await TournamentModel.findById(data.tournamentId);
    if (!t) return { error: "Tournament not found." };
    if (t.status !== "draft") {
      return { error: "Only draft tournaments can be edited." };
    }

    const startDate =
      data.startDate && data.startDate.length > 0
        ? new Date(data.startDate)
        : undefined;

    t.name = data.name;
    t.description = data.description || undefined;
    t.bestOf = data.bestOf;
    t.winMarginThreshold = data.winMarginThreshold;
    t.startDate = startDate;
    await t.save();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { error: e.issues[0]?.message ?? "Validation failed" };
    }
    console.error(e);
    return { error: "Could not update tournament." };
  }

  const id = formData.get("tournamentId");
  revalidatePath("/");
  revalidatePath("/admin/tournaments");
  if (typeof id === "string") {
    revalidatePath(`/admin/tournaments/${id}`);
    revalidatePath(`/tournaments/${id}`);
  }
  return { success: "Saved." };
}

export async function deleteTournamentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("tournamentId");
  if (typeof id !== "string" || !id.length) {
    return { error: "Missing tournament id." };
  }

  const auth = await requireAuthAction();
  if (auth) return auth;

  try {
    await dbConnect();
    const t = await TournamentModel.findById(id);
    if (!t) return { error: "Tournament not found." };
    const deletable =
      t.status === "draft" || t.status === "players_added";
    if (!deletable) {
      return {
        error:
          "Only tournaments before the draw can be deleted (not after Generate draw).",
      };
    }

    await MatchModel.deleteMany({ tournamentId: t._id });
    await PlayerModel.deleteMany({ tournamentId: t._id });
    await TournamentModel.deleteOne({ _id: t._id });
  } catch (e) {
    console.error(e);
    return { error: "Could not delete tournament." };
  }

  revalidatePath("/");
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments");
}
