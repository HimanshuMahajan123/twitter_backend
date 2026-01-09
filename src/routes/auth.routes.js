import {
  registerUser,
  verifyEmail,
  forgotPasswordRequest,
  resetPassword,
  loginUser,
} from "../controllers/auth.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import {
  registerValidator,
  forgotPasswordValidator,
  loginValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
const router = Router();

router.post(
  "/register",
  upload.single("avatar"),
  registerValidator(),
  validate,
  registerUser,
  loginUser,
);

router.get("/verify-email/:verificationToken", verifyEmail);

router.post(
  "/forgot-password",
  forgotPasswordValidator(),
  validate,
  forgotPasswordRequest,
);

router.post("/login", loginValidator(), validate, loginUser);

router.post("/reset-password/:resetToken", resetPassword);
export default router;
