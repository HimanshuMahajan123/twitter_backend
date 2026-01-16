import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "video", "link"],
      required: true,
      index: true,
    },

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
PostSchema.pre("save", function (next) {
  const { type, content } = this;

  if (type === "text" && !content.text) {
    return next(new Error("Text post must have text"));
  }
  if (type === "image" && !content.imageUrl) {
    return next(new Error("Image post must have imageUrl"));
  }
  if (type === "video" && !content.videoUrl) {
    return next(new Error("Video post must have videoUrl"));
  }
  if (type === "link" && !content.linkUrl) {
    return next(new Error("Link post must have linkUrl"));
  }

  next();
});


const Post = model("Post", PostSchema);

export { Post };