/** Shared tournament enums (no Mongo / Mongoose) — safe for client bundles. */

/** Games per knockout match (1 = single total score; 3/5/7 = games won). */
export const BEST_OF_OPTIONS = [1, 3, 5, 7] as const;
export type BestOf = (typeof BEST_OF_OPTIONS)[number];

export const PLAYER_COUNTS = [4, 8, 16, 32] as const;
export type PlayerCount = (typeof PLAYER_COUNTS)[number];

export const TOURNAMENT_STATUSES = [
  "draft",
  "players_added",
  "drawn",
  "in_progress",
  "completed",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];
