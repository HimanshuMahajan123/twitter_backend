import mongoose, { Schema } from "mongoose";

const repostSchema = new Schema(
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

    text: {
      type: String,
    },
  },
  { timestamps: true },
);

repostSchema.index({ userId: 1, createdAt: -1 }, { unique: true });

const Repost = mongoose.model("Repost", repostSchema);

export { Repost };
