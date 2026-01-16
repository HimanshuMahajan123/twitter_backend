import mongoose, { Schema } from "mongoose";
import { User } from "./user.models";

const likesSchema = new Schema({
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
});

export const Likes = mongoose.model("Likes", likesSchema);
