import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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

//constroller for user login
export const loginUser = asyncHandler(async (req, res) => {});

// Controller for user logout
export const logoutUser = asyncHandler(async (req, res) => {});
