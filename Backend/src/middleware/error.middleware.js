const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Convert unknown errors into a consistent ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;

    error = new ApiError(
      statusCode,
      error.message || "Internal server error"
    );
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    data: null,
  };

  // Include validation/custom errors when available
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Never expose stack traces in production
  if (env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  console.error("❌ API Error:", {
    method: req.method,
    url: req.originalUrl,
    statusCode: error.statusCode,
    message: error.message,
  });

  res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;