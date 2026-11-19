const { z } = require("zod");

const careActionTypes = [
  "watering",
  "fertilizing",
  "pruning",
  "repotting",
  "misting",
  "cleaning",
  "treatment",
  "sunlight",
  "pest_control",
  "other",
];

const quantityUnits = [
  "ml",
  "litre",
  "grams",
  "kg",
  "minutes",
  "hours",
  "none",
];

const careLogFields = {
  actionType: z.enum(careActionTypes),

  actionDate: z.coerce.date().optional(),

  quantity: z
    .number()
    .min(0, "Quantity cannot be negative")
    .nullable()
    .optional(),

  quantityUnit: z.enum(quantityUnits).optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Care notes cannot exceed 1000 characters")
    .optional(),
};

const validateQuantityUnit = (data) => {
  if (data.quantity !== null && data.quantity !== undefined) {
    return (
      data.quantityUnit !== undefined &&
      data.quantityUnit !== null &&
      data.quantityUnit !== "none"
    );
  }

  return true;
};

const createCareLogSchema = z
  .object(careLogFields)
  .refine(validateQuantityUnit, {
    message:
      "A valid quantity unit is required when quantity is provided",
    path: ["quantityUnit"],
  });

const updateCareLogSchema = z
  .object({
    actionType: careLogFields.actionType.optional(),

    actionDate: careLogFields.actionDate,

    quantity: careLogFields.quantity,

    quantityUnit: careLogFields.quantityUnit,

    notes: careLogFields.notes,
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for an update",
    }
  )
  .refine(validateQuantityUnit, {
    message:
      "A valid quantity unit is required when quantity is provided",
    path: ["quantityUnit"],
  });

const careLogIdSchema = z.object({
  careLogId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid care log ID"),
});

const plantIdSchema = z.object({
  plantId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid plant ID"),
});

module.exports = {
  careActionTypes,
  quantityUnits,
  createCareLogSchema,
  updateCareLogSchema,
  careLogIdSchema,
  plantIdSchema,
};