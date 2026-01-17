import { Router } from "express";
import {
  UploadPost,
  getFeedPosts,
  trendingPosts,
  repostPost,
} from "../controllers/post.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { get } from "mongoose";

const router = Router();

const multiUpload = upload.fields([
  { name: "images", maxCount: 4 },
  { name: "video", maxCount: 1 },
]);
router.post("/upload", verifyjwt, multiUpload, UploadPost);

router.get("/feed", verifyjwt, getFeedPosts);

router.get("/trending", verifyjwt, trendingPosts);

router.post("/repost/:postId", verifyjwt, repostPost);

export default router;
