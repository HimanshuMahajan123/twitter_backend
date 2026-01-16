import { Router } from "express";
import {
  addLike,
  removeLike,
  getPostLikes,
  isPostLiked,
} from "../controllers/like.controller.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/add/:postId", verifyjwt, addLike);
router.delete("/delete/:postId", verifyjwt, removeLike);
router.get("/list/:postId", verifyjwt, getPostLikes);
router.get("/status/:postId", verifyjwt, isPostLiked);

export default router;
