import { Post } from "../models/posts.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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

export { UploadPost };
