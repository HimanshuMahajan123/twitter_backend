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

  const dateFilter = cursor ? { $lt: new Date(cursor) } : {};

  /* ---------------- FOLLOWING ---------------- */
  const followingDocs = await Follow.find({ followerId: userId })
    .select("followingId -_id");

  const followingIds = followingDocs.map(f => f.followingId.toString());
  const followingSet = new Set(followingIds);

  /* ---------------- MY REPOSTS ---------------- */
  const myReposts = await Repost.find({ userId }).select("postId -_id");
  const myRepostSet = new Set(myReposts.map(r => r.postId.toString()));

  /* ---------------- POSTS (ONE QUERY) ---------------- */
  const posts = await Post.find({
    ...dateFilter,
  })
    .sort({ createdAt: -1 })
    .limit(limit * 3) // candidate pool
    .populate("creator", "username avatar");

  /* ---------------- REPOSTS (ONE QUERY) ---------------- */
  const reposts = await Repost.find({
    ...dateFilter,
  })
    .sort({ createdAt: -1 })
    .limit(limit * 2)
    .populate("userId", "username avatar")
    .populate({
      path: "postId",
      populate: {
        path: "creator",
        select: "username avatar",
      },
    });

  /* ---------------- NORMALIZE ---------------- */
  const postItems = posts.map(post => ({
    type: "POST",
    post,
    createdAt: post.createdAt,
    isRepostedByMe: myRepostSet.has(post._id.toString()),
    isFollowing: followingSet.has(post.creator._id.toString()),
    priority: followingSet.has(post.creator._id.toString()) ? 1 : 3,
  }));

  const repostItems = reposts.map(r => ({
    type: "REPOST",
    post: r.postId,
    repostedBy: r.userId,
    createdAt: r.createdAt,
    isRepostedByMe: r.userId._id.toString() === userId.toString(),
    isFollowing: followingSet.has(r.userId._id.toString()),
    priority: 2,
  }));

  /* ---------------- MERGE & SORT ---------------- */
  const feed = [...postItems, ...repostItems]
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.createdAt - a.createdAt;
    })
    .slice(0, limit);

  /* ---------------- RESPONSE ---------------- */
  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: feed,
        nextCursor: feed.length
          ? feed[feed.length - 1].createdAt
          : null,
      },
      "Feed fetched successfully"
    )
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
