const User = require("../models/User");

const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/jwt");

const authenticate = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new ApiError(
      401,
      "Authentication required. Please provide an access token."
    );
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "Invalid authentication format. Use Bearer <token>."
    );
  }

  const token = authorizationHeader.substring(7).trim();

  if (!token) {
    throw new ApiError(401, "Access token is missing.");
  }

  let decodedToken;

  try {
    decodedToken = verifyAccessToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired. Please login again.");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token.");
    }

    throw error;
  }

  const user = await User.findById(decodedToken.sub);

  if (!user) {
    throw new ApiError(401, "User associated with this token was not found.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  req.user = user;

  next();
});

module.exports = authenticate;