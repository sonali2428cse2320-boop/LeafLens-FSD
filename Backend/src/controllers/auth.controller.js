const User = require("../models/User");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateAccessToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const accessToken = generateAccessToken(user);

  res.status(201).json(
    new ApiResponse(201, "Account created successfully.", {
      user: user.toSafeObject(),
      accessToken,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);

  res.status(200).json(
    new ApiResponse(200, "Login successful.", {
      user: user.toSafeObject(),
      accessToken,
    })
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Current user retrieved successfully.", {
      user: req.user.toSafeObject(),
    })
  );
});

module.exports = {
  register,
  login,
  getCurrentUser,
};