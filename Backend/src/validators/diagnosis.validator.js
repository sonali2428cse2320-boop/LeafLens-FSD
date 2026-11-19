
const { z } = require("zod");

const { DIAGNOSIS_LIMITS } = require("../constants/ai.constants");

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ID.");

const plantIdSchema = z.object({
  plantId: objectIdSchema,
});

const diagnosisRequestSchema = z.object({
  imageId: objectIdSchema,
  symptoms: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Symptoms cannot be empty.")
        .max(DIAGNOSIS_LIMITS.MAX_SYMPTOM_LENGTH)
    )
    .max(DIAGNOSIS_LIMITS.MAX_SYMPTOMS)
    .optional()
    .default([]),
});

const diagnosisIdSchema = z.object({
  plantId: objectIdSchema,
  diagnosisId: objectIdSchema,
});

const diagnosisHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(DIAGNOSIS_LIMITS.MAX_RESULTS_PER_PAGE)
    .default(DIAGNOSIS_LIMITS.DEFAULT_PAGE_SIZE),
});

module.exports = {
  plantIdSchema,
  diagnosisRequestSchema,
  diagnosisIdSchema,
  diagnosisHistoryQuerySchema,
};
