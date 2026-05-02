"use server";

import { revalidatePath } from "next/cache";

import { requireAuthAction } from "@/lib/auth/guard";
import { dbConnect } from "@/lib/db";
import { advanceWinner } from "@/lib/tournament/advanceWinner";
import { resultSchema } from "@/lib/tournament/validations";

import type { ActionState } from "./tournaments";

export async function submitResultAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireAuthAction();
  if (auth) return auth;

  const raw = Object.fromEntries(formData.entries());
  const parsed = resultSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid scores." };
  }

  const { matchId, gameScoresText } = parsed.data;

  await dbConnect();
  const out = await advanceWinner({
    matchId,
    gameScoresText,
  });

  if (!out.ok) {
    return { error: out.error };
  }

  const tid = out.tournamentId;
  revalidatePath(`/admin/tournaments/${tid}`);
  revalidatePath(`/tournaments/${tid}`);
  revalidatePath("/admin/tournaments");
  revalidatePath("/");
  return { success: "Result saved." };
}
