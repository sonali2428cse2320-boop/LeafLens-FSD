const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const plantHistoryService = require("../services/plant/plant-history.service");

const getPlantTimeline = asyncHandler(async (req, res) => {
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

  let startDate;

  if (req.query.startDate) {
    startDate = new Date(req.query.startDate);

    if (Number.isNaN(startDate.getTime())) {
      startDate = undefined;
    }
  }

  let endDate;

  if (req.query.endDate) {
    endDate = new Date(req.query.endDate);

    if (Number.isNaN(endDate.getTime())) {
      endDate = undefined;
    }
  }

  const result =
    await plantHistoryService.getPlantTimeline(
      req.user._id,
      req.params.plantId,
      {
        page,
        limit,
        eventType: req.query.eventType,
        startDate,
        endDate,
      }
    );

  res.status(200).json(
    new ApiResponse(
      200,
      "Plant timeline retrieved successfully.",
      {
        timeline: result.timeline,
        pagination: result.pagination,
      }
    )
  );
});

module.exports = {
  getPlantTimeline,
};