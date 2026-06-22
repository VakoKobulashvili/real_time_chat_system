import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/jwt.js";
import { catchAsync } from "../utils/catchAsync.js";

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName || user.username,
  avatar: user.avatar,
  isOnline: user.isOnline,
  createdAt: user.createdAt,
});

export const register = catchAsync(async (req, res) => {
  const { username, email, password, displayName } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const field = existingUser.email === email ? "email" : "username";
    throw new ApiError(409, `${field} already exists`);
  }

  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: formatUser(user),
      token,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: formatUser(user),
      token,
    },
  });
});

export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    data: {
      user: formatUser(req.user),
    },
  });
});
