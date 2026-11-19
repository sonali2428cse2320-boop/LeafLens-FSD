
const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  diagnosePlantController,
  getDiagnosisController,
  getDiagnosisHistoryController,
} = require("../controllers/diagnosis.controller");

const {
  plantIdSchema,
  diagnosisRequestSchema,
  diagnosisIdSchema,
  diagnosisHistoryQuerySchema,
} = require("../validators/diagnosis.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/plants/:plantId/diagnose",
  validate(plantIdSchema, "params"),
  validate(diagnosisRequestSchema, "body"),
  diagnosePlantController
);

router.get(
  "/plants/:plantId/diagnoses",
  validate(plantIdSchema, "params"),
  validate(diagnosisHistoryQuerySchema, "query"),
  getDiagnosisHistoryController
);

router.get(
  "/plants/:plantId/diagnoses/:diagnosisId",
  validate(diagnosisIdSchema, "params"),
  getDiagnosisController
);

module.exports = router;
