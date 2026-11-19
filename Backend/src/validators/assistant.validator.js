
const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid plant ID.");

const assistantPlantParamsSchema = z.object({
  plantId: objectIdSchema,
});

const assistantMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please enter a message.")
    .max(2000, "Message cannot exceed 2000 characters."),
});

module.exports = {
  assistantPlantParamsSchema,
  assistantMessageSchema,
};
