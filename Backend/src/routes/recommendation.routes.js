
const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  generatePlantRecommendationsController,
  getPlantRecommendationsController,
  getRecommendationByIdController,
  updateRecommendationStatusController,
  deleteRecommendationController,
} = require("../controllers/recommendation.controller");

const {
  plantIdSchema,
  recommendationIdSchema,
  recommendationQuerySchema,
  updateRecommendationStatusSchema,
} = require("../validators/recommendation.validator");

const router = express.Router();

// All recommendation endpoints require authentication.
router.use(authenticate);

// Generate personalized AI recommendations.
router.post(
  "/plants/:plantId/recommendations/generate",
  validate(plantIdSchema, "params"),
  generatePlantRecommendationsController
);

// Retrieve recommendations for a plant.
router.get(
  "/plants/:plantId/recommendations",
  validate(plantIdSchema, "params"),
  validate(recommendationQuerySchema, "query"),
  getPlantRecommendationsController
);

// Retrieve a specific recommendation.
router.get(
  "/plants/:plantId/recommendations/:recommendationId",
  validate(recommendationIdSchema, "params"),
  getRecommendationByIdController
);

// Update recommendation status.
router.patch(
  "/plants/:plantId/recommendations/:recommendationId/status",
  validate(recommendationIdSchema, "params"),
  validate(updateRecommendationStatusSchema, "body"),
  updateRecommendationStatusController
);

// Delete a recommendation.
router.delete(
  "/plants/:plantId/recommendations/:recommendationId",
  validate(recommendationIdSchema, "params"),
  deleteRecommendationController
);

module.exports = router;
