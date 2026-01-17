import { Post } from "../models/posts.models.js";


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";


const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId }).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");

  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, "User dashboard fetched successfully", { user, posts }));
});

const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate("followers", "username name avatar");

  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, "Followers fetched successfully", { followers: user.followers }));
});

const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate("following", "username name avatar");

  if (!user) {
    return res.status(404).json(new ApiResponse(404, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, "Following fetched successfully", { following: user.following }));
});

export { getUserDashboard , getFollowers, getFollowing };