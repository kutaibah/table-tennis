import mongoose, { type InferSchemaType, type Model, Schema } from "mongoose";

const playerSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    nickname: { type: String, trim: true },
    seed: { type: Number, min: 1 },
  },
  { timestamps: true },
);

playerSchema.index({ tournamentId: 1, name: 1 });

export type PlayerDocument = InferSchemaType<typeof playerSchema> & {
  _id: mongoose.Types.ObjectId;
};

const PlayerModel =
  (mongoose.models.Player as Model<PlayerDocument>) ||
  mongoose.model<PlayerDocument>("Player", playerSchema);

export default PlayerModel;
