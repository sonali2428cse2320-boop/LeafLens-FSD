const { z } = require("zod");

const timelineEventTypes = [
  "care",
  "growth",
  "image",
];

const plantIdSchema = z.object({
  plantId: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid plant ID"
    ),
});

const timelineQuerySchema = z.object({
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

  eventType: z
    .enum(timelineEventTypes)
    .optional(),

  startDate: z.coerce
    .date()
    .optional(),

  endDate: z.coerce
    .date()
    .optional(),
});

module.exports = {
  timelineEventTypes,
  plantIdSchema,
  timelineQuerySchema,
};