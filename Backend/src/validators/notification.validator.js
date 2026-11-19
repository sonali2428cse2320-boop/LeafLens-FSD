const { z } = require("zod");

const notificationTypes = [
  "watering_reminder",
  "fertilizing_reminder",
  "care_reminder",
  "health_alert",
  "growth_update",
  "ai_insight",
  "system",
];

const notificationIdSchema = z.object({
  notificationId: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid notification ID"
    ),
});

const notificationQuerySchema = z.object({
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

  unreadOnly: z
    .enum(["true", "false"])
    .optional(),

  type: z
    .enum(notificationTypes)
    .optional(),
});

const createNotificationSchema = z.object({
  plant: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid plant ID"
    )
    .nullable()
    .optional(),

  type: z.enum(notificationTypes),

  title: z
    .string()
    .trim()
    .min(1, "Notification title is required")
    .max(
      200,
      "Notification title cannot exceed 200 characters"
    ),

  message: z
    .string()
    .trim()
    .min(1, "Notification message is required")
    .max(
      1000,
      "Notification message cannot exceed 1000 characters"
    ),

  scheduledFor: z.coerce.date().nullable().optional(),

  metadata: z
    .record(z.string(), z.any())
    .optional(),
});

module.exports = {
  notificationTypes,
  notificationIdSchema,
  notificationQuerySchema,
  createNotificationSchema,
};