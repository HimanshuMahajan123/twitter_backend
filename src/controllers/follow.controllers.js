import mongoose from "mongoose";
import { Follow } from "../models/follow.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

export const addFollow = asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { userId: followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (followerId.equals(followingId)) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  try {
    await Follow.create({
      followerId,
      followingId,
    });
  } catch (error) {
    // Duplicate follow (compound unique index)
    if (error.code === 11000) {
      throw new ApiError(409, "Already following this user");
    }
    throw error;
  }

  res
    .status(201)
    .json(new ApiResponse(201, null, "User followed successfully"));
});
export const removeFollow = asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { userId: followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const removed = await Follow.findOneAndDelete({
    followerId,
    followingId,
  });

  if (!removed) {
    throw new ApiError(404, "Follow relationship not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "User unfollowed successfully"));
});
export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const followers = await Follow.find({ followingId: userId })
    .populate("followerId", "username name avatar")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: followers.length,
        followers,
      },
      "Followers fetched successfully",
    ),
  );
});
export const getFollowing = asyncHandler(async (req, res) => {
  const userId = req.user._id;


  const following = await Follow.find({ followerId: userId })
    .populate("followingId", "username name avatar")
    .sort({ createdAt: -1 });
  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: following.length,
        following,
      },
      "Following fetched successfully",
    ),
  );
});
