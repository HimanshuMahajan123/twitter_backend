import { Router } from "express";
import { UploadPost } from "../controllers/post.controllers.js";
import upload from "../middlewares/multer.middlewares.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

const router = Router();

const multiUpload = upload.fields([
  { name: "images", maxCount: 4 },
  { name: "video", maxCount: 1 },
]);
router.post("/upload", verifyjwt, multiUpload, UploadPost);

export default router;
