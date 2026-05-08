import { z } from "zod";

import { PLAYER_COUNTS } from "@/lib/tournament/constants";

export const allowedPlayerCountSchema = z.coerce
  .number()
  .refine(
    (n): n is (typeof PLAYER_COUNTS)[number] =>
      (PLAYER_COUNTS as readonly number[]).includes(n),
    {
      message:
        "Knockout tournaments currently require 4, 8, 16, or 32 players.",
    },
  );

export const tournamentCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().max(2000).optional(),
  ),
  playerCount: allowedPlayerCountSchema,
  roundFormatsJson: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(2, "Configure match format for each round."),
  ),
  startDate: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().optional(),
  ),
});

export const tournamentUpdateSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().max(2000).optional(),
  ),
  roundFormatsJson: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(2, "Round formats are required."),
  ),
  startDate: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().optional(),
  ),
});

export const playerCreateSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(1, "Player name is required").max(120),
  nickname: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().max(120).optional(),
  ),
  seed: z.preprocess((v) => {
    if (v === "" || v == null) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }, z.number().int().min(1).optional()),
});

export const resultSchema = z.object({
  matchId: z.string().min(1),
  gameScoresText: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "Enter scores (one line per game: A points, then B)."),
  ),
});

export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): z.infer<T> {
  const entries = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;
  return schema.parse(entries);
}
