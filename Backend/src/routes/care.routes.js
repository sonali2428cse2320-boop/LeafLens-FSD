const express = require("express");

const {
  createCareLog,
  getPlantCareLogs,
  getCareLogById,
  updateCareLog,
  deleteCareLog,
} = require("../controllers/care.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createCareLogSchema,
  updateCareLogSchema,
  careLogIdSchema,
  plantIdSchema,
} = require("../validators/care.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/plants/:plantId/care-logs",
  validate(plantIdSchema, "params"),
  validate(createCareLogSchema),
  createCareLog
);

router.get(
  "/plants/:plantId/care-logs",
  validate(plantIdSchema, "params"),
  getPlantCareLogs
);

router.get(
  "/plants/:plantId/care-logs/:careLogId",
  validate(
    plantIdSchema.merge(careLogIdSchema),
    "params"
  ),
  getCareLogById
);

router.patch(
  "/plants/:plantId/care-logs/:careLogId",
  validate(
    plantIdSchema.merge(careLogIdSchema),
    "params"
  ),
  validate(updateCareLogSchema),
  updateCareLog
);

router.delete(
  "/plants/:plantId/care-logs/:careLogId",
  validate(
    plantIdSchema.merge(careLogIdSchema),
    "params"
  ),
  deleteCareLog
);

module.exports = router;