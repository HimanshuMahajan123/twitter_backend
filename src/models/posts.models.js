import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {

    content: {
      text: { type: String },
      imageUrl: { type: String },
      videoUrl: { type: String },
      linkUrl: { type: String },
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    repostsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  }
);

PostSchema.index({ creator: 1, createdAt: -1 });



const Post = model("Post", PostSchema);

export { Post };