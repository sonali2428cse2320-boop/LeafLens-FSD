const { z } = require("zod");

const recommendationSources = [
  "manual",
  "ai",
  "diagnosis",
  "environment",
  "system",
];

const recommendationCategories = [
  "watering",
  "fertilizing",
  "lighting",
  "temperature",
  "humidity",
  "soil",
  "repotting",
  "pruning",
  "pest_control",
  "disease_treatment",
  "general_care",
  "other",
];

const recommendationPriorities = [
  "low",
  "medium",
  "high",
  "critical",
];

const recommendationStatuses = [
  "active",
  "completed",
  "dismissed",
  "expired",
];

const createRecommendationSchema = z.object({
  plant: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid plant ID"
    ),

  source: z
    .enum(recommendationSources)
    .optional(),

  category: z.enum(recommendationCategories),

  priority: z
    .enum(recommendationPriorities)
    .optional(),

  title: z
    .string()
    .trim()
    .min(1, "Recommendation title is required")
    .max(
      200,
      "Recommendation title cannot exceed 200 characters"
    ),

  message: z
    .string()
    .trim()
    .min(1, "Recommendation message is required")
    .max(
      2000,
      "Recommendation message cannot exceed 2000 characters"
    ),

  action: z
    .string()
    .trim()
    .max(
      1000,
      "Recommendation action cannot exceed 1000 characters"
    )
    .optional(),

  reason: z
    .string()
    .trim()
    .max(
      2000,
      "Recommendation reason cannot exceed 2000 characters"
    )
    .optional(),

  confidence: z
    .number()
    .min(0, "Confidence cannot be below 0")
    .max(1, "Confidence cannot exceed 1")
    .nullable()
    .optional(),

  evidence: z
    .array(z.string().trim().min(1))
    .max(20, "Evidence cannot contain more than 20 items")
    .optional(),

  expiresAt: z
    .coerce
    .date()
    .nullable()
    .optional(),

  metadata: z
    .record(z.string(), z.any())
    .optional(),
});

const recommendationIdSchema = z.object({
  recommendationId: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid recommendation ID"
    ),
});

const plantIdSchema = z.object({
  plantId: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid plant ID"
    ),
});

const recommendationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional(),

  status: z
    .enum(recommendationStatuses)
    .optional(),

  category: z
    .enum(recommendationCategories)
    .optional(),

  priority: z
    .enum(recommendationPriorities)
    .optional(),

  activeOnly: z
    .enum(["true", "false"])
    .optional(),
});

const updateRecommendationStatusSchema =
  z.object({
    status: z.enum([
      "completed",
      "dismissed",
      "active",
    ]),
  });

module.exports = {
  recommendationSources,
  recommendationCategories,
  recommendationPriorities,
  recommendationStatuses,
  createRecommendationSchema,
  recommendationIdSchema,
  plantIdSchema,
  recommendationQuerySchema,
  updateRecommendationStatusSchema,
};