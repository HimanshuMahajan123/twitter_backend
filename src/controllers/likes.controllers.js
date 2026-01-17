import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { Post } from "../models/posts.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

export const addLike = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  try {
    await Like.create({
      userId,
      postId,
    });

    // Atomic increment (FAST)
    await Post.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });
  } catch (error) {
    // Duplicate like
    if (error.code === 11000) {
      throw new ApiError(409, "Post already liked");
    }
    throw error;
  }

  res
    .status(201)
    .json(new ApiResponse(201, null, "Post liked successfully"));
});


export const removeLike = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const removed = await Like.findOneAndDelete({
    userId,
    postId,
  });

  if (!removed) {
    throw new ApiError(404, "Like not found");
  }

  await Post.findByIdAndUpdate(postId, {
    $inc: { likesCount: -1 },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Like removed successfully"));
});


export const getPostLikes = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const likes = await Like.find({ postId })
    .populate("userId", "username name avatar")
    .sort({ createdAt: -1 });
  console.log(likes);
  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: likes.length,
        likes,
      },
      "Post likes fetched successfully",
    ),
  );
});

export const isPostLiked = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const liked = await Like.exists({
    userId,
    postId,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { isLiked: Boolean(liked) },
      "Like status fetched successfully",
    ),
  );
});
