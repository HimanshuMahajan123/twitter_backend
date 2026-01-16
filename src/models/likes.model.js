import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.index(
  { userId: 1, postId: 1 },
  { unique: true }
);

export const Like = mongoose.model("Like", LikeSchema);
