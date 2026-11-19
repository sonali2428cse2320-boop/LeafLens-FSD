const express = require("express");

const {
  getPlantTimeline,
} = require("../controllers/history.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  plantIdSchema,
  timelineQuerySchema,
} = require("../validators/history.validator");

const router = express.Router();

router.use(authenticate);

router.get(
  "/plants/:plantId/timeline",
  validate(plantIdSchema, "params"),
  validate(timelineQuerySchema, "query"),
  getPlantTimeline
);

module.exports = router;