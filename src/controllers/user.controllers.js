import { Post } from "../models/posts.models.js";


import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Follow } from "../models/follow.models.js";
import {Like} from "../models/likes.model.js";
import { Repost } from "../models/repost.models.js";
const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  /* ---------------- USER ---------------- */
  const user = await User.findById(userId).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
  );

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, "User not found"));
  }

  /* ---------------- FOLLOW DATA ---------------- */

  // People who FOLLOW me
  const followers = await Follow.find({ followingId: userId })
    .populate("followerId", "username name avatar")
    .select("followerId -_id");

  // People I am FOLLOWING
  const following = await Follow.find({ followerId: userId })
    .populate("followingId", "username name avatar")
    .select("followingId -_id");

  /* ---------------- COUNTS ---------------- */
  const followersCount = followers.length;
  const followingCount = following.length;

 /* ---------------- USER POSTS ---------------- */
const posts = await Post.find({ creator: userId })
  .populate("creator", "username name avatar")
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

/* ---------------- ADD REPOST META ---------------- */
const repostedPostIds = await Repost.find({ userId })
  .select("postId -_id");

const repostSet = new Set(
  repostedPostIds.map(r => r.postId.toString())
);

const enrichedPosts = posts.map(p => ({
  ...p,
  isRepostedByMe: repostSet.has(p._id.toString()),
}));

  const postsCount = await Post.countDocuments({ creator: userId });

  /* ---------------- RESPONSE ---------------- */
  return res.status(200).json(
    new ApiResponse(
      200,
      "User dashboard fetched successfully",
      {
        user,
        followers: followers.map(f => f.followerId),
        following: following.map(f => f.followingId),
        stats: {
          followersCount,
          followingCount,
          postsCount,
        },
        posts: enrichedPosts,
      }
    )
  );
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

const updateprofile = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const userId = req.user._id;
  const updateData = {};

  if (key === "name") {
    updateData.name = req.body.name;
  } else if (key === "username") {
    updateData.username = req.body.username;
  } else if (key === "bio") {
    updateData.bio = req.body.bio;
  } else if (key === "avatar") {
    updateData.avatar = req.body.avatar;
  } else {
    return res.status(400).json(new ApiResponse(400, "Invalid profile field"));
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");

  return res.status(200).json(new ApiResponse(200, "Profile updated successfully", { user: updatedUser }));
});

const toggleLike = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Post not found"));
  }

  const existingLike = await Like.findOne({
    userId,
    postId,
  });

  // UNLIKE
  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });

    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: -1 } }
    );

    return res.status(200).json(
      new ApiResponse(200, "Post unliked", {
        liked: false,
      })
    );
  }

  // LIKE
  await Like.create({
    userId,
    postId,
  });

  await Post.updateOne(
    { _id: postId },
    { $inc: { likesCount: 1 } }
  );

  return res.status(200).json(
    new ApiResponse(200, "Post liked", {
      liked: true,
    })
  );
});


const toggleFollow = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { userId: targetUserId } = req.params;
  console.log(userId, targetUserId);
  if (userId.toString() === targetUserId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "You cannot follow yourself"));
  }

  const existingFollow = await Follow.findOne({
    followerId: userId,
    followingId: targetUserId,
  });

  if (existingFollow) {
    await Follow.deleteOne({ _id: existingFollow._id });

    return res.status(200).json(
      new ApiResponse(200, "Unfollowed successfully", {
        following: false,
      })
    );
  }

  await Follow.create({
    followerId: userId,
    followingId: targetUserId,
  });

  return res.status(200).json(
    new ApiResponse(200, "Followed successfully", {
      following: true,
    })
  );
});

export { getUserDashboard , getFollowers, getFollowing , updateprofile, toggleLike, toggleFollow };