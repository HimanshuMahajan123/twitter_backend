import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

export const verifyjwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); //getting accessToken either from cookies or from header

  if (!token) {
    throw new ApiError(404, "Unauthorized request , no token provided");
  }

  try {
    //jwt.verify() returns the decoded payload that was used to create the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-refreshToken -password -emailVerificationToken",
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized access , User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized request!");
  }
});
