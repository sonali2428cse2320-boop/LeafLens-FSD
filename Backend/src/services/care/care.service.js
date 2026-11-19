const mongoose = require("mongoose");

const CareLog = require("../../models/CareLog");
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

const createCareLog = async (userId, plantId, careData) => {
  await verifyPlantOwnership(userId, plantId);

  const careLog = await CareLog.create({
    ...careData,
    plant: plantId,
    user: userId,
  });

  return careLog;
};

const getPlantCareLogs = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(userId, plantId);

  const {
    page = 1,
    limit = 20,
    actionType,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    plant: plantId,
    user: userId,
  };

  if (actionType) {
    filter.actionType = actionType;
  }

  const [careLogs, total] = await Promise.all([
    CareLog.find(filter)
      .sort({ actionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

    CareLog.countDocuments(filter),
  ]);

  return {
    careLogs,
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

const getCareLogById = async (
  userId,
  plantId,
  careLogId
) => {
  validateObjectId(careLogId, "care log ID");

  await verifyPlantOwnership(userId, plantId);

  const careLog = await CareLog.findOne({
    _id: careLogId,
    plant: plantId,
    user: userId,
  });

  if (!careLog) {
    throw new ApiError(404, "Care log not found.");
  }

  return careLog;
};

const updateCareLog = async (
  userId,
  plantId,
  careLogId,
  updateData
) => {
  validateObjectId(careLogId, "care log ID");

  await verifyPlantOwnership(userId, plantId);

  delete updateData.plant;
  delete updateData.user;

  const careLog = await CareLog.findOneAndUpdate(
    {
      _id: careLogId,
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

  if (!careLog) {
    throw new ApiError(404, "Care log not found.");
  }

  return careLog;
};

const deleteCareLog = async (
  userId,
  plantId,
  careLogId
) => {
  validateObjectId(careLogId, "care log ID");

  await verifyPlantOwnership(userId, plantId);

  const careLog = await CareLog.findOneAndDelete({
    _id: careLogId,
    plant: plantId,
    user: userId,
  });

  if (!careLog) {
    throw new ApiError(404, "Care log not found.");
  }

  return careLog;
};

module.exports = {
  createCareLog,
  getPlantCareLogs,
  getCareLogById,
  updateCareLog,
  deleteCareLog,
};