import mongoose, { type InferSchemaType, type Model, Schema } from "mongoose";

import {
  BEST_OF_OPTIONS,
  PLAYER_COUNTS,
  TOURNAMENT_STATUSES,
} from "@/lib/tournament/constants";

const roundFormatEntrySchema = new Schema(
  {
    round: { type: Number, required: true, min: 1 },
    bestOf: {
      type: Number,
      required: true,
      enum: [1, 3, 5, 7],
    },
    winMarginThreshold: {
      type: Number,
      default: 1,
      min: 1,
      max: 99,
    },
  },
  { _id: false },
);

const tournamentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    playerCount: {
      type: Number,
      required: true,
      enum: PLAYER_COUNTS,
    },
    /**
     * Legacy single format (round 1 defaults). Use roundFormats when set for
     * per-stage games / thresholds.
     */
    bestOf: {
      type: Number,
      enum: BEST_OF_OPTIONS,
      default: 1,
    },
    /** When bestOf is 1: minimum point gap (per-round overrides in roundFormats). */
    winMarginThreshold: {
      type: Number,
      default: 1,
      min: 1,
      max: 99,
    },
    /** One entry per bracket round (length = log2(playerCount)). */
    roundFormats: {
      type: [roundFormatEntrySchema],
      default: undefined,
    },
    status: {
      type: String,
      enum: TOURNAMENT_STATUSES,
      default: "draft",
    },
    championPlayerId: { type: Schema.Types.ObjectId, ref: "Player" },
    startDate: { type: Date },
  },
  { timestamps: true },
);

tournamentSchema.index({ status: 1, createdAt: -1 });

export type TournamentDocument = InferSchemaType<typeof tournamentSchema> & {
  _id: mongoose.Types.ObjectId;
};

const TournamentModel =
  (mongoose.models.Tournament as Model<TournamentDocument>) ||
  mongoose.model<TournamentDocument>("Tournament", tournamentSchema);

export default TournamentModel;
