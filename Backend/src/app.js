
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const plantRoutes = require("./routes/plant.routes");
const imageRoutes = require("./routes/image.routes");
const careRoutes = require("./routes/care.routes");
const growthRoutes = require("./routes/growth.routes");
const historyRoutes = require("./routes/history.routes");
const notificationRoutes = require("./routes/notification.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const identificationRoutes = require("./routes/identification.routes");
const diagnosisRoutes = require("./routes/diagnosis.routes");
const assistantRoutes = require("./routes/assistant.routes");

const env = require("./config/env");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.disable("x-powered-by");

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Request body parsing
app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Global API rate limiter
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalRateLimiter);

// Stricter rate limiter for AI operations.
// This limits requests per client IP; it is not a substitute
// for per-user quotas or authenticated usage limits.
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

app.use(
  "/api/v1/assistant",
  aiRateLimiter,
  assistantRoutes
);

// Health check
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "LeafLens API is running",
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// API root
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to LeafLens AI API",
  });
});

// Authentication
app.use("/api/v1/auth", authRoutes);

// Plant management
app.use("/api/v1/plants", plantRoutes);

// Plant images
app.use("/api/v1", imageRoutes);

// Plant care tracking
app.use("/api/v1/care", careRoutes);

// Growth tracking
app.use("/api/v1/growth", growthRoutes);

// Plant history
app.use("/api/v1/history", historyRoutes);

// AI diagnosis
app.use("/api/v1/diagnosis", aiRateLimiter, diagnosisRoutes);

// Notifications and reminders
app.use("/api/v1/notifications", notificationRoutes);

// AI and stored recommendations
app.use(
  "/api/v1/recommendations",
  aiRateLimiter,
  recommendationRoutes
);

// AI plant identification
app.use(
  "/api/v1/identification",
  aiRateLimiter,
  identificationRoutes
);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
});

// Global error handler — must remain the last middleware
app.use(errorMiddleware);

module.exports = app;
