const { z } = require("zod");

const lightConditions = [
  "low",
  "indirect",
  "bright-indirect",
  "direct",
  "mixed",
  "unknown",
];

const indoorOutdoorValues = [
  "indoor",
  "outdoor",
  "both",
  "unknown",
];

const healthStatuses = [
  "healthy",
  "attention",
  "critical",
  "unknown",
];

const createPlantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plant name is required")
    .max(100, "Plant name cannot exceed 100 characters"),

  nickname: z
    .string()
    .trim()
    .max(100, "Nickname cannot exceed 100 characters")
    .optional(),

  species: z
    .string()
    .trim()
    .max(150, "Species cannot exceed 150 characters")
    .optional(),

  scientificName: z
    .string()
    .trim()
    .max(150, "Scientific name cannot exceed 150 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .toLowerCase()
    .max(50, "Category cannot exceed 50 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  acquiredAt: z
    .coerce
    .date()
    .nullable()
    .optional(),

  location: z
    .string()
    .trim()
    .max(200, "Location cannot exceed 200 characters")
    .optional(),

  lightCondition: z
    .enum(lightConditions)
    .optional(),

  indoorOutdoor: z
    .enum(indoorOutdoorValues)
    .optional(),

  wateringFrequency: z
    .number()
    .min(0, "Watering frequency cannot be negative")
    .max(365, "Watering frequency cannot exceed 365 days")
    .nullable()
    .optional(),

  fertilizingFrequency: z
    .number()
    .min(0, "Fertilizing frequency cannot be negative")
    .max(365, "Fertilizing frequency cannot exceed 365 days")
    .nullable()
    .optional(),

  careNotes: z
    .string()
    .trim()
    .max(2000, "Care notes cannot exceed 2000 characters")
    .optional(),

  healthStatus: z
    .enum(healthStatuses)
    .optional(),

  healthScore: z
    .number()
    .min(0, "Health score cannot be below 0")
    .max(100, "Health score cannot exceed 100")
    .nullable()
    .optional(),
});

const updatePlantSchema = createPlantSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for an update"
  );

const plantIdSchema = z.object({
  plantId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid plant ID"),
});

module.exports = {
  createPlantSchema,
  updatePlantSchema,
  plantIdSchema,
};