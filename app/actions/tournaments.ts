"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAuthAction } from "@/lib/auth/guard";
import { dbConnect } from "@/lib/db";
import { buildRoundFormatsForSave } from "@/lib/tournament/matchFormat";
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

    const built = buildRoundFormatsForSave({
      playerCount: data.playerCount,
      bestOf: 1,
      winMarginThreshold: 1,
      roundFormatsJson: data.roundFormatsJson,
    });
    if (!built.ok) {
      return { error: built.error };
    }
    const formats = built.formats;
    const first = formats[0];
    if (!first) {
      return { error: "Invalid round formats." };
    }

    const startDate =
      data.startDate && data.startDate.length > 0
        ? new Date(data.startDate)
        : undefined;

    const t = await TournamentModel.create({
      name: data.name,
      description: data.description || undefined,
      playerCount: data.playerCount,
      bestOf: first.bestOf,
      winMarginThreshold: first.winMarginThreshold,
      roundFormats: formats,
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

    const built = buildRoundFormatsForSave({
      playerCount: t.playerCount as number,
      bestOf: 1,
      winMarginThreshold: 1,
      roundFormatsJson: data.roundFormatsJson,
    });
    if (!built.ok) {
      return { error: built.error };
    }
    const formats = built.formats;
    const first = formats[0];
    if (!first) {
      return { error: "Invalid round formats." };
    }

    const plainFormats = formats.map((f) => ({
      round: f.round,
      bestOf: f.bestOf,
      winMarginThreshold: f.winMarginThreshold,
    }));

    console.log("[updateTournamentAction] incoming JSON:", data.roundFormatsJson);
    console.log("[updateTournamentAction] plainFormats:", plainFormats);

    const updateSet: Record<string, unknown> = {
      name: data.name,
      bestOf: first.bestOf,
      winMarginThreshold: first.winMarginThreshold,
      roundFormats: plainFormats,
    };
    if (data.description != null && data.description !== "") {
      updateSet.description = data.description;
    }
    if (startDate) {
      updateSet.startDate = startDate;
    }

    const updated = await TournamentModel.findByIdAndUpdate(
      data.tournamentId,
      { $set: updateSet },
      { new: true, runValidators: false },
    ).lean();

    console.log(
      "[updateTournamentAction] saved roundFormats:",
      (updated as { roundFormats?: unknown })?.roundFormats,
    );
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
