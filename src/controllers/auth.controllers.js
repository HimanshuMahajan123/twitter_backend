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

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefrehshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Couldn't generate jwt tokens!", error);
    throw new ApiError(500, "Error generating Access and Refresh Tokens");
  }
};

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

//Controller for forgot password
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with given email not found");
  }

  const { hashedToken, unhashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`,
    ),
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "password reset email sent successfully"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //find user with the hashed token and token expiry greater than current time
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "password reset successfully"));
});

//constroller for user login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Both fields are necessary");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Email or Password");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "to proceed , verify your email first!");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

// Controller for user logout
export const logoutUser = asyncHandler(async (req, res) => {});
