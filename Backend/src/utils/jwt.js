const jwt = require("jsonwebtoken");

const env = require("../config/env");

const generateAccessToken = (user) => {
  if (!user || !user._id) {
    throw new Error("A valid user is required to generate an access token");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};

const verifyAccessToken = (token) => {
  if (!token) {
    throw new Error("Access token is required");
  }

  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};