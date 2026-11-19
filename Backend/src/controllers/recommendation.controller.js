
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const {
  getPlantRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
} = require("../services/ai/recommendation.service");

const {
  generatePlantRecommendations,
} = require("../services/ai/recommendation-generation.service");

// Generate personalized AI recommendations for a plant.
const generatePlantRecommendationsController = asyncHandler(
  async (req, res) => {
    const result = await generatePlantRecommendations({
      userId: req.user._id,
      plantId: req.params.plantId,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        "AI recommendations generated successfully.",
        {
          recommendations: result.recommendations.map((recommendation) =>
            recommendation.toSafeObject()
          ),
          model: result.model,
          generatedAt: result.generatedAt,
        }
      )
    );
  }
);

// Get recommendations for a specific plant.
const getPlantRecommendationsController = asyncHandler(
  async (req, res) => {
    const { plantId } = req.params;

    const result = await getPlantRecommendations(
      req.user._id,
      plantId,
      req.query
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Plant recommendations retrieved successfully.",
        {
          recommendations: result.recommendations.map((recommendation) =>
            recommendation.toSafeObject()
          ),
          pagination: result.pagination,
        }
      )
    );
  }
);

// Get one recommendation by ID.
const getRecommendationByIdController = asyncHandler(
  async (req, res) => {
    const { plantId, recommendationId } = req.params;

    const recommendation = await getRecommendationById(
      req.user._id,
      plantId,
      recommendationId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation retrieved successfully.",
        recommendation.toSafeObject()
      )
    );
  }
);

// Update a recommendation's status.
const updateRecommendationStatusController = asyncHandler(
  async (req, res) => {
    const { plantId, recommendationId } = req.params;
    const { status } = req.body;

    const recommendation = await updateRecommendationStatus(
      req.user._id,
      plantId,
      recommendationId,
      status
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation status updated successfully.",
        recommendation.toSafeObject()
      )
    );
  }
);

// Delete a recommendation.
const deleteRecommendationController = asyncHandler(
  async (req, res) => {
    const { plantId, recommendationId } = req.params;

    await deleteRecommendation(
      req.user._id,
      plantId,
      recommendationId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recommendation deleted successfully.",
        null
      )
    );
  }
);

module.exports = {
  generatePlantRecommendationsController,
  getPlantRecommendationsController,
  getRecommendationByIdController,
  updateRecommendationStatusController,
  deleteRecommendationController,
};
