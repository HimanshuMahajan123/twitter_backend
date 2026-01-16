import mongoose, { Schema, model } from "mongoose";

const FollowSchema = new Schema(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);
//indexing 
FollowSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true }
);


const Follow = model("Follow", FollowSchema);

export { Follow };