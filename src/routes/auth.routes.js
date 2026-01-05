import {
  registerUser,
  verifyEmail,
  forgotPasswordRequest,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import {
  registerValidator,
  forgotPasswordValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
const router = Router();

router.post(
  "/register",
  upload.single("avatar"),
  registerValidator(),
  validate,
  registerUser,
);

router.get("/verify-email/:verificationToken", verifyEmail);

router.post(
  "/forgot-password",
  forgotPasswordValidator(),
  validate,
  forgotPasswordRequest,
);

router.post("/reset-password/:resetToken", resetPassword);
export default router;
