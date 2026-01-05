import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";

// Controller for user registration
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const avatar = req.file?.path; //accessing avatar file path if uploaded

  //check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with given email or username already exists");
  }

  const newUser = await User.create({
    name,
    username,
    email,
    password,
  });

  //sending email verification mail
  const { hashedToken, unhashedToken, tokenExpiry } =
    newUser.generateTemporaryToken();

  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationTokenExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });
  await sendEmail({
    email: newUser?.email,
    subject: "verify your email address",
    mailgenContent: emailVerificationMailgenContent(
      newUser?.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  //If avatar is provided, upload to cloudinary and save the url
  if (avatar) {
    const cloudinaryUrl = await uploadToCloudinary(avatar);
    if (!cloudinaryUrl) {
      throw new ApiError(500, "Failed to upload avatar");
    }
    newUser.avatar = cloudinaryUrl;
    await newUser.save({ validateBeforeSave: false });
  }

  const createdUser = await User.findById(newUser._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user. Please try again Later.");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully",
      ),
    );
});

//Controller for email verifcation
export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params; //getting unhashed token from params

  if (!verificationToken) {
    throw new ApiError(400, "Verification token is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  //find user with the hashed token and token expiry greater than current time'
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or Expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully",
      ),
    );
});

//constroller for user login
export const loginUser = asyncHandler(async (req, res) => {});

// Controller for user logout
export const logoutUser = asyncHandler(async (req, res) => {});
