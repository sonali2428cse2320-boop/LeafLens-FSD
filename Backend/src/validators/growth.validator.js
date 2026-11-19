const { z } = require("zod");

const measurementUnits = ["cm", "m", "in", "ft"];

const createGrowthRecordSchema = z.object({
  recordedAt: z.coerce.date().optional(),

  height: z
    .number()
    .min(0, "Height cannot be negative")
    .nullable()
    .optional(),

  heightUnit: z
    .enum(measurementUnits)
    .optional(),

  width: z
    .number()
    .min(0, "Width cannot be negative")
    .nullable()
    .optional(),

  widthUnit: z
    .enum(measurementUnits)
    .optional(),

  leafCount: z
    .number()
    .int("Leaf count must be a whole number")
    .min(0, "Leaf count cannot be negative")
    .max(100000, "Leaf count is too large")
    .nullable()
    .optional(),

  newLeaves: z
    .number()
    .int("New leaf count must be a whole number")
    .min(0, "New leaf count cannot be negative")
    .max(100000, "New leaf count is too large")
    .nullable()
    .optional(),

  healthScore: z
    .number()
    .min(0, "Health score cannot be below 0")
    .max(100, "Health score cannot exceed 100")
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Growth notes cannot exceed 1000 characters")
    .optional(),
});

const updateGrowthRecordSchema = z
  .object({
    recordedAt: z.coerce.date().optional(),

    height: z
      .number()
      .min(0, "Height cannot be negative")
      .nullable()
      .optional(),

    heightUnit: z
      .enum(measurementUnits)
      .optional(),

    width: z
      .number()
      .min(0, "Width cannot be negative")
      .nullable()
      .optional(),

    widthUnit: z
      .enum(measurementUnits)
      .optional(),

    leafCount: z
      .number()
      .int("Leaf count must be a whole number")
      .min(0, "Leaf count cannot be negative")
      .max(100000, "Leaf count is too large")
      .nullable()
      .optional(),

    newLeaves: z
      .number()
      .int("New leaf count must be a whole number")
      .min(0, "New leaf count cannot be negative")
      .max(100000, "New leaf count is too large")
      .nullable()
      .optional(),

    healthScore: z
      .number()
      .min(0, "Health score cannot be below 0")
      .max(100, "Health score cannot exceed 100")
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Growth notes cannot exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for an update",
    }
  );

const growthRecordIdSchema = z.object({
  growthRecordId: z
    .string()
    .regex(
      /^[a-fA-F0-9]{24}$/,
      "Invalid growth record ID"
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

module.exports = {
  measurementUnits,
  createGrowthRecordSchema,
  updateGrowthRecordSchema,
  growthRecordIdSchema,
  plantIdSchema,
};