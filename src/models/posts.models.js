import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    content: {
      text: { type: String },
      imageUrl: {
        type: [String],
        default: [],
      },
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
  },
);

PostSchema.index({ creator: 1, createdAt: -1 });
PostSchema.index({ likesCount: -1, createdAt: -1 }); // index added to fetch the trending posts

//mongoose hook to avoid empty posts (eg : {creator : user123} , there is no text/image/video)
PostSchema.pre("validate", function () {
  const { text, imageUrl = [], videoUrl = [], linkUrl } = this.content || {};

  const hasContent = text || imageUrl.length > 0 || videoUrl || linkUrl;

  if (!hasContent) {
    throw new Error("Post must contain some content");
  }
});

const Post = model("Post", PostSchema);

export { Post };
