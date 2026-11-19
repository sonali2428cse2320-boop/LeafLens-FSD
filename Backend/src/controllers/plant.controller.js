const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const plantService = require("../services/plant/plant.service");

const createPlant = asyncHandler(async (req, res) => {
  const plant = await plantService.createPlant(req.user._id, req.body);

  res.status(201).json(
    new ApiResponse(201, "Plant created successfully.", {
      plant: plant.toSafeObject(),
    })
  );
});

const getUserPlants = asyncHandler(async (req, res) => {
  const includeArchived =
    req.query.includeArchived === "true";

  const page = Math.max(
    Number.parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(req.query.limit, 10) || 20,
      1
    ),
    100
  );

  const result = await plantService.getUserPlants(
    req.user._id,
    {
      includeArchived,
      page,
      limit,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Plants retrieved successfully.",
      {
        plants: result.plants.map((plant) =>
          plant.toSafeObject()
        ),
        pagination: result.pagination,
      }
    )
  );
});

const getPlantById = asyncHandler(async (req, res) => {
  const plant = await plantService.getUserPlantById(
    req.user._id,
    req.params.plantId
  );

  res.status(200).json(
    new ApiResponse(200, "Plant retrieved successfully.", {
      plant: plant.toSafeObject(),
    })
  );
});

const updatePlant = asyncHandler(async (req, res) => {
  const plant = await plantService.updateUserPlant(
    req.user._id,
    req.params.plantId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(200, "Plant updated successfully.", {
      plant: plant.toSafeObject(),
    })
  );
});

const archivePlant = asyncHandler(async (req, res) => {
  const plant = await plantService.archiveUserPlant(
    req.user._id,
    req.params.plantId
  );

  res.status(200).json(
    new ApiResponse(200, "Plant archived successfully.", {
      plant: plant.toSafeObject(),
    })
  );
});

const deletePlant = asyncHandler(async (req, res) => {
  await plantService.deleteUserPlant(
    req.user._id,
    req.params.plantId
  );

  res.status(200).json(
    new ApiResponse(200, "Plant deleted successfully.", null)
  );
});

module.exports = {
  createPlant,
  getUserPlants,
  getPlantById,
  updatePlant,
  archivePlant,
  deletePlant,
};