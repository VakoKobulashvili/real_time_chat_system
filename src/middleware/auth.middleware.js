import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Access token is required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;
  next();
});
