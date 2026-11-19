
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const {
  getPlantAssistantResponse,
} = require("../services/ai/assistant.service");

const chatWithPlantAssistant = asyncHandler(
  async (req, res) => {
    const result = await getPlantAssistantResponse({
      userId: req.user._id,
      plantId: req.params.plantId,
      message: req.body.message,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Plant assistant response generated successfully.",
        result
      )
    );
  }
);

module.exports = {
  chatWithPlantAssistant,
};
