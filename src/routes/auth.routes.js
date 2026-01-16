import {
  registerUser,
  verifyEmail,
  forgotPasswordRequest,
  resetPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import {
  registerValidator,
  forgotPasswordValidator,
  loginValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";

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

router.post("/login", loginValidator(), validate, loginUser);

router.post("/reset-password/:resetToken", resetPassword);

router.post("/logout", verifyjwt, logoutUser);
router.post("/refresh-access-token", verifyjwt, refreshAccessToken);
export default router;
