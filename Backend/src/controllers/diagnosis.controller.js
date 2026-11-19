
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const {
  diagnosePlant,
  getDiagnosisById,
  getDiagnosisHistory,
} = require("../services/ai/diagnosis.service");

const diagnosePlantController = asyncHandler(async (req, res) => {
  const { plantId } = req.params;
  const { imageId, symptoms = [] } = req.body;

  const diagnosis = await diagnosePlant({
    userId: req.user._id,
    plantId,
    imageId,
    symptoms,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Plant health assessment completed successfully.",
      diagnosis.toSafeObject()
    )
  );
});

const getDiagnosisController = asyncHandler(async (req, res) => {
  const { plantId, diagnosisId } = req.params;

  const diagnosis = await getDiagnosisById(
    req.user._id,
    plantId,
    diagnosisId
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Diagnosis retrieved successfully.",
      diagnosis.toSafeObject()
    )
  );
});

const getDiagnosisHistoryController = asyncHandler(async (req, res) => {
  const { plantId } = req.params;

  const history = await getDiagnosisHistory(
    req.user._id,
    plantId,
    req.query
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Diagnosis history retrieved successfully.",
      {
        diagnoses: history.diagnoses.map((diagnosis) =>
          diagnosis.toSafeObject()
        ),
        pagination: history.pagination,
      }
    )
  );
});

module.exports = {
  diagnosePlantController,
  getDiagnosisController,
  getDiagnosisHistoryController,
};
