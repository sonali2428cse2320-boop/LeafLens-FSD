const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const ApiError = require("../../utils/ApiError");

const validateObjectId = (plantId) => {
  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    throw new ApiError(400, "Invalid plant ID.");
  }
};

const createPlant = async (userId, plantData) => {
  const plant = await Plant.create({
    ...plantData,
    user: userId,
  });

  return plant;
};

const getUserPlants = async (userId, options = {}) => {
  const {
    includeArchived = false,
    page = 1,
    limit = 20,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  if (!includeArchived) {
    filter.isArchived = false;
  }

  const [plants, total] = await Promise.all([
    Plant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Plant.countDocuments(filter),
  ]);

  return {
    plants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getUserPlantById = async (userId, plantId) => {
  validateObjectId(plantId);

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  return plant;
};

const updateUserPlant = async (userId, plantId, updateData) => {
  validateObjectId(plantId);

  // Never allow ownership to be changed through this method.
  delete updateData.user;

  const plant = await Plant.findOneAndUpdate(
    {
      _id: plantId,
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

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  return plant;
};

const archiveUserPlant = async (userId, plantId) => {
  validateObjectId(plantId);

  const plant = await Plant.findOneAndUpdate(
    {
      _id: plantId,
      user: userId,
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
      },
    },
    {
      new: true,
    }
  );

  if (!plant) {
    throw new ApiError(404, "Active plant not found.");
  }

  return plant;
};

const deleteUserPlant = async (userId, plantId) => {
  validateObjectId(plantId);

  const plant = await Plant.findOneAndDelete({
    _id: plantId,
    user: userId,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  return plant;
};

module.exports = {
  createPlant,
  getUserPlants,
  getUserPlantById,
  updateUserPlant,
  archiveUserPlant,
  deleteUserPlant,
};