import { Post } from "../models/posts.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Follow } from "../models/follow.models.js";
import { Repost } from "../models/repost.models.js";
import fs from "fs";

const UploadPost = asyncHandler(async (req, res) => {
  const { text, linkUrl } = req.body || {};
  const { images: imageFiles = [], video = [] } = req.files || {};

  //restrict empty posts
  if (!text && !linkUrl && !imageFiles.length && !video.length) {
    throw new ApiError(400, "Post content is required");
  }

  const videoFile = video[0]; //multer ensures that there is only one video file

  if (imageFiles.length > 0 && videoFile) {
    //manually erase the files from disk storage
    fs.unlinkSync(videoFile.path);
    imageFiles.map((file) => {
      fs.unlinkSync(file.path);
    });
    throw new ApiError(422, "Images and Videos cannot be uploaded at one time");
  }

  const uploadedImages = [];
  if (imageFiles.length > 0) {
    //use for...of loop as it is "async-aware"
    for (const file of imageFiles) {
      const localFilePath = file.path;

      const cloudinaryUrl = await uploadToCloudinary(localFilePath);
      uploadedImages.push(cloudinaryUrl);
    }
  }

  let videoUrl;
  if (videoFile) {
    videoUrl = await uploadToCloudinary(videoFile.path);
  }

  //   console.log(req.user);

  const post = await Post.create({
    creator: req.user._id,
    content: {
      text: text?.trim(),
      linkUrl: linkUrl?.trim(),
      imageUrl: uploadedImages,
      videoUrl,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { postID: post._id },
        "A new post uploaded successfully",
      ),
    );
});

const getFeedPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cursor = req.query.cursor;
  const limit = parseInt(req.query.limit) || 10;

  const dateFilter = cursor ? { $lt: new Date(cursor) } : null;

  const following = await Follow.find({ followerId: userId }).select(
    "followingId -_id",
  );

  const followingIds = following.map((f) => f.followingId);

  //For posts
  const posts = await Post.find({
    creator: { $in: [...followingIds] },
    ...(dateFilter && { createdAt: dateFilter }),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("creator", "username avatar");

  const postFeedItems = posts.map((post) => ({
    type: "POST",
    post,
    createdAt: post.createdAt,
  }));

  /* ---------------- REPOSTS ---------------- */
  const reposts = await Repost.find({
    userId: { $in: followingIds },
    ...(dateFilter && { createdAt: dateFilter }),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username avatar")
    .populate({
      path: "postId",
      populate: {
        path: "creator",
        select: "username avatar",
      },
    });

  const repostFeedItems = reposts.map((repost) => ({
    type: "REPOST",
    post: repost.postId,
    repostedBy: repost.userId,
    text: repost.text,
    createdAt: repost.createdAt,
  }));

  /* ---------------- MERGE & SORT ---------------- */
  let feed = [...postFeedItems, ...repostFeedItems]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: feed,
        nextCursor: feed.length ? feed[feed.length - 1].createdAt : null,
      },
      "Feed fetched successfully",
    ),
  );
});

const trendingPosts = asyncHandler(async (req, res) => {
  const limit = 5;
  const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : null;

  // Build cursor query
  const query = cursor
    ? {
        $or: [
          { likesCount: { $lt: cursor.likesCount } },
          {
            likesCount: cursor.likesCount,
            createdAt: { $lt: new Date(cursor.createdAt) },
          },
        ],
      }
    : {};

  // Fetch trending posts
  const posts = await Post.find({ ...query })
    .sort({ likesCount: -1, createdAt: -1 })
    .limit(limit)
    .populate("creator", "username avatar");

  // Prepare nextCursor
  const nextCursor =
    posts.length > 0
      ? JSON.stringify({
          likesCount: posts[posts.length - 1].likesCount,
          createdAt: posts[posts.length - 1].createdAt,
        })
      : null;

  // Send response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        trendingPosts: posts,
        nextCursor,
      },
      "Trending Posts fetched successfully",
    ),
  );
});

const repostPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId } = req.params;
  const { text } = req.body;

  if (!postId) {
    throw new ApiError(400, "Post ID is required");
  }

  const postExists = await Post.exists({ _id: postId });
  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  const existingRepost = await Repost.findOne({ userId, postId });

  // Undo repost
  if (existingRepost) {
    throw new ApiError(409, "A post can not be reposted twice");
  }

  //Create repost
  const repost = await Repost.create({
    userId,
    postId,
    text: text?.trim() || undefined,
  });

  const populatedRepost = await Repost.findById(repost._id)
    .populate("userId", "username avatar")
    .populate({
      path: "postId",
      populate: {
        path: "creator",
        select: "username avatar",
      },
    });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { repost: populatedRepost },
        "Repost added successfully",
      ),
    );
});

export { UploadPost, getFeedPosts, trendingPosts, repostPost };
