
const mongoose = require("mongoose");

const Recommendation = require("../../models/Recommendation");
const Plant = require("../../models/Plant");

const ApiError = require("../../utils/ApiError");

const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }
};

const verifyPlantOwnership = async (userId, plantId) => {
  validateObjectId(plantId, "plant ID");

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  return plant;
};

// Create a recommendation for a plant owned by the user.
const createRecommendation = async (userId, recommendationData) => {
  if (!recommendationData || !recommendationData.plant) {
    throw new ApiError(400, "Plant ID is required.");
  }

  await verifyPlantOwnership(userId, recommendationData.plant);

  const recommendation = await Recommendation.create({
    ...recommendationData,
    user: userId,
  });

  return recommendation;
};

// Retrieve paginated recommendations with optional filters.
const getPlantRecommendations = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(userId, plantId);

  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    activeOnly = false,
  } = options;

  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);

  if (
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1 ||
    !Number.isInteger(normalizedLimit) ||
    normalizedLimit < 1 ||
    normalizedLimit > 100
  ) {
    throw new ApiError(400, "Invalid pagination parameters.");
  }

  const shouldReturnActiveOnly =
    activeOnly === true || activeOnly === "true";

  const skip = (normalizedPage - 1) * normalizedLimit;

  const filter = {
    plant: plantId,
    user: userId,
  };

  if (shouldReturnActiveOnly) {
    filter.status = "active";
  } else if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  const [recommendations, total] = await Promise.all([
    Recommendation.find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(normalizedLimit),

    Recommendation.countDocuments(filter),
  ]);

  return {
    recommendations,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.ceil(total / normalizedLimit),
      hasNextPage: normalizedPage * normalizedLimit < total,
      hasPreviousPage: normalizedPage > 1,
    },
  };
};

// Retrieve one recommendation belonging to the user and plant.
const getRecommendationById = async (
  userId,
  plantId,
  recommendationId
) => {
  validateObjectId(recommendationId, "recommendation ID");

  await verifyPlantOwnership(userId, plantId);

  const recommendation = await Recommendation.findOne({
    _id: recommendationId,
    plant: plantId,
    user: userId,
  });

  if (!recommendation) {
    throw new ApiError(404, "Recommendation not found.");
  }

  return recommendation;
};

// Update recommendation status and maintain status timestamps.
const updateRecommendationStatus = async (
  userId,
  plantId,
  recommendationId,
  status
) => {
  validateObjectId(recommendationId, "recommendation ID");

  const allowedStatuses = ["active", "completed", "dismissed"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid recommendation status.");
  }

  await verifyPlantOwnership(userId, plantId);

  const now = new Date();

  const updateData = {
    status,
  };

  if (status === "completed") {
    updateData.completedAt = now;
    updateData.dismissedAt = null;
  } else if (status === "dismissed") {
    updateData.dismissedAt = now;
    updateData.completedAt = null;
  } else {
    updateData.completedAt = null;
    updateData.dismissedAt = null;
  }

  const recommendation = await Recommendation.findOneAndUpdate(
    {
      _id: recommendationId,
      plant: plantId,
      user: userId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!recommendation) {
    throw new ApiError(404, "Recommendation not found.");
  }

  return recommendation;
};

// Delete a recommendation belonging to the authenticated user.
const deleteRecommendation = async (
  userId,
  plantId,
  recommendationId
) => {
  validateObjectId(recommendationId, "recommendation ID");

  await verifyPlantOwnership(userId, plantId);

  const recommendation = await Recommendation.findOneAndDelete({
    _id: recommendationId,
    plant: plantId,
    user: userId,
  });

  if (!recommendation) {
    throw new ApiError(404, "Recommendation not found.");
  }

  return recommendation;
};

// Expire active recommendations whose expiry date has passed.
const expireRecommendations = async (now = new Date()) => {
  const result = await Recommendation.updateMany(
    {
      status: "active",
      expiresAt: {
        $ne: null,
        $lte: now,
      },
    },
    {
      $set: {
        status: "expired",
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

module.exports = {
  createRecommendation,
  getPlantRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  deleteRecommendation,
  expireRecommendations,
};
