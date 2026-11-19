const dotenv = require("dotenv");
const { z } = require("zod");

// Load environment variables from .env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),

  CLIENT_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),

  JWT_EXPIRES_IN: z
    .string()
    .min(1)
    .default("7d"),

  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required"),

  GEMINI_MODEL: z
  .string()
  .min(1).default("gemini-3.8-flash"),

  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME is required"),

  CLOUDINARY_API_KEY: z
    .string()
    .min(1, "CLOUDINARY_API_KEY is required"),

  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration:");

  for (const issue of parsedEnv.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

const env = Object.freeze(parsedEnv.data);

module.exports = env;
