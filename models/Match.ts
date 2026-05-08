import mongoose, { type InferSchemaType, type Model, Schema } from "mongoose";

/** `live` = partial per-game scores saved, match not decided yet. */
const MATCH_STATUSES = ["pending", "live", "completed"] as const;

const matchSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    round: { type: Number, required: true, min: 1 },
    matchNumber: { type: Number, required: true, min: 1 },
    playerAId: { type: Schema.Types.ObjectId, ref: "Player" },
    playerBId: { type: Schema.Types.ObjectId, ref: "Player" },
    playerAScore: { type: Number },
    playerBScore: { type: Number },
    /** Per-game points: A then B per row (table tennis games). */
    gameScores: [
      {
        a: { type: Number, required: true },
        b: { type: Number, required: true },
      },
    ],
    winnerPlayerId: { type: Schema.Types.ObjectId, ref: "Player" },
    nextMatchId: { type: Schema.Types.ObjectId, ref: "Match" },
    nextMatchSlot: { type: String, enum: ["A", "B"] },
    status: {
      type: String,
      enum: MATCH_STATUSES,
      default: "pending",
    },
  },
  { timestamps: true },
);

matchSchema.index({ tournamentId: 1, round: 1, matchNumber: 1 }, { unique: true });

export type MatchDocument = InferSchemaType<typeof matchSchema> & {
  _id: mongoose.Types.ObjectId;
};

const MatchModel =
  (mongoose.models.Match as Model<MatchDocument>) ||
  mongoose.model<MatchDocument>("Match", matchSchema);

export default MatchModel;
