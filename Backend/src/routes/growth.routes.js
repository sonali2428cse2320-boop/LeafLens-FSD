const express = require("express");

const {
  createGrowthRecord,
  getPlantGrowthRecords,
  getGrowthRecordById,
  updateGrowthRecord,
  deleteGrowthRecord,
} = require("../controllers/growth.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createGrowthRecordSchema,
  updateGrowthRecordSchema,
  growthRecordIdSchema,
  plantIdSchema,
} = require("../validators/growth.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/plants/:plantId/growth",
  validate(plantIdSchema, "params"),
  validate(createGrowthRecordSchema),
  createGrowthRecord
);

router.get(
  "/plants/:plantId/growth",
  validate(plantIdSchema, "params"),
  getPlantGrowthRecords
);

router.get(
  "/plants/:plantId/growth/:growthRecordId",
  validate(
    plantIdSchema.merge(growthRecordIdSchema),
    "params"
  ),
  getGrowthRecordById
);

router.patch(
  "/plants/:plantId/growth/:growthRecordId",
  validate(
    plantIdSchema.merge(growthRecordIdSchema),
    "params"
  ),
  validate(updateGrowthRecordSchema),
  updateGrowthRecord
);

router.delete(
  "/plants/:plantId/growth/:growthRecordId",
  validate(
    plantIdSchema.merge(growthRecordIdSchema),
    "params"
  ),
  deleteGrowthRecord
);

module.exports = router;