const mongoose = require("mongoose");

const GrowthRecord = require("../../models/GrowthRecord");
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

const createGrowthRecord = async (
  userId,
  plantId,
  growthData
) => {
  await verifyPlantOwnership(userId, plantId);

  const growthRecord = await GrowthRecord.create({
    ...growthData,
    plant: plantId,
    user: userId,
  });

  return growthRecord;
};

const getPlantGrowthRecords = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(userId, plantId);

  const {
    page = 1,
    limit = 20,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    plant: plantId,
    user: userId,
  };

  const [growthRecords, total] = await Promise.all([
    GrowthRecord.find(filter)
      .sort({
        recordedAt: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    GrowthRecord.countDocuments(filter),
  ]);

  return {
    growthRecords,
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

const getGrowthRecordById = async (
  userId,
  plantId,
  growthRecordId
) => {
  validateObjectId(
    growthRecordId,
    "growth record ID"
  );

  await verifyPlantOwnership(userId, plantId);

  const growthRecord = await GrowthRecord.findOne({
    _id: growthRecordId,
    plant: plantId,
    user: userId,
  });

  if (!growthRecord) {
    throw new ApiError(
      404,
      "Growth record not found."
    );
  }

  return growthRecord;
};

const updateGrowthRecord = async (
  userId,
  plantId,
  growthRecordId,
  updateData
) => {
  validateObjectId(
    growthRecordId,
    "growth record ID"
  );

  await verifyPlantOwnership(userId, plantId);

  delete updateData.plant;
  delete updateData.user;

  const growthRecord =
    await GrowthRecord.findOneAndUpdate(
      {
        _id: growthRecordId,
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

  if (!growthRecord) {
    throw new ApiError(
      404,
      "Growth record not found."
    );
  }

  return growthRecord;
};

const deleteGrowthRecord = async (
  userId,
  plantId,
  growthRecordId
) => {
  validateObjectId(
    growthRecordId,
    "growth record ID"
  );

  await verifyPlantOwnership(userId, plantId);

  const growthRecord =
    await GrowthRecord.findOneAndDelete({
      _id: growthRecordId,
      plant: plantId,
      user: userId,
    });

  if (!growthRecord) {
    throw new ApiError(
      404,
      "Growth record not found."
    );
  }

  return growthRecord;
};

module.exports = {
  createGrowthRecord,
  getPlantGrowthRecords,
  getGrowthRecordById,
  updateGrowthRecord,
  deleteGrowthRecord,
};