const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  identifyPlantController,
  getIdentificationController,
  getIdentificationHistoryController,
} = require("../controllers/identification.controller");

const {
  identificationRequestSchema,
  identificationIdSchema,
  plantIdSchema,
  identificationHistoryQuerySchema,
} = require("../validators/identification.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/plants/:plantId/identify",
  validate(plantIdSchema, "params"),
  validate(identificationRequestSchema, "body"),
  identifyPlantController
);

router.get(
  "/plants/:plantId/identifications",
  validate(plantIdSchema, "params"),
  validate(
    identificationHistoryQuerySchema,
    "query"
  ),
  getIdentificationHistoryController
);

router.get(
  "/plants/:plantId/identifications/:identificationId",
  validate(plantIdSchema, "params"),
  validate(
    identificationIdSchema,
    "params"
  ),
  getIdentificationController
);

module.exports = router;