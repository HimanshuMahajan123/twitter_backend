import { Router } from "express";
import {
  addLike,
  removeLike,
  getPostLikes,
  isPostLiked,
} from "../controllers/like.controller.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/like/:postId", verifyjwt, addLike);
router.delete("/like/:postId", verifyjwt, removeLike);
router.get("/likes/:postId", verifyjwt, getPostLikes);
router.get("/like/status/:postId", verifyjwt, isPostLiked);

export default router;
