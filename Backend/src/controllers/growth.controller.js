const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const growthService = require("../services/plant/growth.service");

const createGrowthRecord = asyncHandler(
  async (req, res) => {
    const growthRecord =
      await growthService.createGrowthRecord(
        req.user._id,
        req.params.plantId,
        req.body
      );

    res.status(201).json(
      new ApiResponse(
        201,
        "Growth record created successfully.",
        {
          growthRecord:
            growthRecord.toSafeObject(),
        }
      )
    );
  }
);

const getPlantGrowthRecords = asyncHandler(
  async (req, res) => {
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

    const result =
      await growthService.getPlantGrowthRecords(
        req.user._id,
        req.params.plantId,
        {
          page,
          limit,
        }
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Growth records retrieved successfully.",
        {
          growthRecords:
            result.growthRecords.map(
              (record) =>
                record.toSafeObject()
            ),

          pagination: result.pagination,
        }
      )
    );
  }
);

const getGrowthRecordById = asyncHandler(
  async (req, res) => {
    const growthRecord =
      await growthService.getGrowthRecordById(
        req.user._id,
        req.params.plantId,
        req.params.growthRecordId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Growth record retrieved successfully.",
        {
          growthRecord:
            growthRecord.toSafeObject(),
        }
      )
    );
  }
);

const updateGrowthRecord = asyncHandler(
  async (req, res) => {
    const growthRecord =
      await growthService.updateGrowthRecord(
        req.user._id,
        req.params.plantId,
        req.params.growthRecordId,
        req.body
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Growth record updated successfully.",
        {
          growthRecord:
            growthRecord.toSafeObject(),
        }
      )
    );
  }
);

const deleteGrowthRecord = asyncHandler(
  async (req, res) => {
    await growthService.deleteGrowthRecord(
      req.user._id,
      req.params.plantId,
      req.params.growthRecordId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        "Growth record deleted successfully.",
        null
      )
    );
  }
);

module.exports = {
  createGrowthRecord,
  getPlantGrowthRecords,
  getGrowthRecordById,
  updateGrowthRecord,
  deleteGrowthRecord,
};