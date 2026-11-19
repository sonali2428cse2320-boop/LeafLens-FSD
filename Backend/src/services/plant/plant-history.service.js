const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const CareLog = require("../../models/CareLog");
const GrowthRecord = require("../../models/GrowthRecord");
const PlantImage = require("../../models/PlantImage");

const ApiError = require("../../utils/ApiError");

const validateObjectId = (plantId) => {
  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    throw new ApiError(400, "Invalid plant ID.");
  }
};

const verifyPlantOwnership = async (userId, plantId) => {
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

const getPlantTimeline = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(userId, plantId);

  const {
    page = 1,
    limit = 20,
    eventType,
    startDate,
    endDate,
  } = options;

  const skip = (page - 1) * limit;

  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = startDate;
  }

  if (endDate) {
    dateFilter.$lte = endDate;
  }

  const hasDateFilter = Object.keys(dateFilter).length > 0;

  const timelinePromises = [];

  /*
   * Care logs
   */
  if (!eventType || eventType === "care") {
    const careFilter = {
      plant: plantId,
      user: userId,
    };

    if (hasDateFilter) {
      careFilter.actionDate = dateFilter;
    }

    timelinePromises.push(
      CareLog.find(careFilter)
        .lean()
        .then((records) =>
          records.map((record) => ({
            id: record._id,
            eventType: "care",
            eventDate: record.actionDate,
            title: `${record.actionType} care`,
            description: record.notes || "",
            data: {
              actionType: record.actionType,
              quantity: record.quantity,
              quantityUnit: record.quantityUnit,
              performedBy: record.performedBy,
            },
            source: {
              model: "CareLog",
              id: record._id,
            },
            createdAt: record.createdAt,
          }))
        )
    );
  }

  /*
   * Growth records
   */
  if (!eventType || eventType === "growth") {
    const growthFilter = {
      plant: plantId,
      user: userId,
    };

    if (hasDateFilter) {
      growthFilter.recordedAt = dateFilter;
    }

    timelinePromises.push(
      GrowthRecord.find(growthFilter)
        .lean()
        .then((records) =>
          records.map((record) => ({
            id: record._id,
            eventType: "growth",
            eventDate: record.recordedAt,
            title: "Growth recorded",
            description: record.notes || "",
            data: {
              height: record.height,
              heightUnit: record.heightUnit,
              width: record.width,
              widthUnit: record.widthUnit,
              leafCount: record.leafCount,
              newLeaves: record.newLeaves,
              healthScore: record.healthScore,
            },
            source: {
              model: "GrowthRecord",
              id: record._id,
            },
            createdAt: record.createdAt,
          }))
        )
    );
  }

  /*
   * Plant images
   */
  if (!eventType || eventType === "image") {
    const imageFilter = {
      plant: plantId,
      user: userId,
    };

    if (hasDateFilter) {
      imageFilter.createdAt = dateFilter;
    }

    timelinePromises.push(
      PlantImage.find(imageFilter)
        .lean()
        .then((records) =>
          records.map((record) => ({
            id: record._id,
            eventType: "image",
            eventDate: record.createdAt,
            title: "Plant image added",
            description: record.caption || "",
            data: {
              imageUrl: record.imageUrl,
              imageType: record.imageType,
              isPrimary: record.isPrimary,
              width: record.width,
              height: record.height,
            },
            source: {
              model: "PlantImage",
              id: record._id,
            },
            createdAt: record.createdAt,
          }))
        )
    );
  }

  const timelineGroups = await Promise.all(
    timelinePromises
  );

  const timeline = timelineGroups
    .flat()
    .sort(
      (a, b) =>
        new Date(b.eventDate) -
        new Date(a.eventDate)
    );

  const total = timeline.length;

  const paginatedTimeline = timeline.slice(
    skip,
    skip + limit
  );

  return {
    timeline: paginatedTimeline,
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

module.exports = {
  getPlantTimeline,
};