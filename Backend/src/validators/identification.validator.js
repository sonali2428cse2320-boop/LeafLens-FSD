const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid ID format."
  );

const plantIdSchema = z.object({
  plantId: objectIdSchema,
});

const identificationRequestSchema =
  z.object({
    plantId: objectIdSchema,
  });

const identificationIdSchema =
  z.object({
    identificationId: objectIdSchema,
  });

const identificationHistoryQuerySchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  });

module.exports = {
  plantIdSchema,
  identificationRequestSchema,
  identificationIdSchema,
  identificationHistoryQuerySchema,
};