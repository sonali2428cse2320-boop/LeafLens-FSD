
const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  chatWithPlantAssistant,
} = require("../controllers/assistant.controller");

const {
  assistantPlantParamsSchema,
  assistantMessageSchema,
} = require("../validators/assistant.validator");

const router = express.Router();

router.use(authenticate);

router.post(
  "/plants/:plantId/chat",
  validate(assistantPlantParamsSchema, "params"),
  validate(assistantMessageSchema, "body"),
  chatWithPlantAssistant
);

module.exports = router;
