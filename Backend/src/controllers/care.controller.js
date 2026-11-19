const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const careService = require("../services/care/care.service");

const createCareLog = asyncHandler(async (req, res) => {
  const careLog = await careService.createCareLog(
    req.user._id,
    req.params.plantId,
    req.body
  );

  res.status(201).json(
    new ApiResponse(
      201,
      "Care log created successfully.",
      {
        careLog: careLog.toSafeObject(),
      }
    )
  );
});

const getPlantCareLogs = asyncHandler(async (req, res) => {
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

  const result = await careService.getPlantCareLogs(
    req.user._id,
    req.params.plantId,
    {
      page,
      limit,
      actionType: req.query.actionType,
    }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Care logs retrieved successfully.",
      {
        careLogs: result.careLogs.map((careLog) =>
          careLog.toSafeObject()
        ),
        pagination: result.pagination,
      }
    )
  );
});

const getCareLogById = asyncHandler(async (req, res) => {
  const careLog = await careService.getCareLogById(
    req.user._id,
    req.params.plantId,
    req.params.careLogId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Care log retrieved successfully.",
      {
        careLog: careLog.toSafeObject(),
      }
    )
  );
});

const updateCareLog = asyncHandler(async (req, res) => {
  const careLog = await careService.updateCareLog(
    req.user._id,
    req.params.plantId,
    req.params.careLogId,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Care log updated successfully.",
      {
        careLog: careLog.toSafeObject(),
      }
    )
  );
});

const deleteCareLog = asyncHandler(async (req, res) => {
  await careService.deleteCareLog(
    req.user._id,
    req.params.plantId,
    req.params.careLogId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Care log deleted successfully.",
      null
    )
  );
});

module.exports = {
  createCareLog,
  getPlantCareLogs,
  getCareLogById,
  updateCareLog,
  deleteCareLog,
};