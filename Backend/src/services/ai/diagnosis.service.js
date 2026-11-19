
const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const PlantImage = require("../../models/PlantImage");
const Diagnosis = require("../../models/Diagnosis");

const ApiError = require("../../utils/ApiError");

const {
  generateFromImage,
} = require("./gemini.service");

const {
  DIAGNOSIS_CONFIDENCE_THRESHOLD,
  DIAGNOSIS_STATUS,
  DIAGNOSIS_HEALTH_STATUS,
  DIAGNOSIS_LIMITS,
} = require("../../constants/ai.constants");

const DIAGNOSIS_SCHEMA = {
  type: "object",
  properties: {
    symptoms: {
      type: "array",
      items: { type: "string" },
    },
    overallAssessment: {
      type: "string",
    },
    healthStatus: {
      type: "string",
      enum: ["healthy", "mild", "moderate", "severe", "uncertain"],
    },
    confidence: {
      type: "number",
    },
    possibleCauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          likelihood: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          explanation: { type: "string" },
          evidence: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "name",
          "likelihood",
          "explanation",
          "evidence",
        ],
      },
    },
    recommendedActions: {
      type: "array",
      items: { type: "string" },
    },
    preventionTips: {
      type: "array",
      items: { type: "string" },
    },
    requiresExpert: {
      type: "boolean",
    },
  },
  required: [
    "symptoms",
    "overallAssessment",
    "healthStatus",
    "confidence",
    "possibleCauses",
    "recommendedActions",
    "preventionTips",
    "requiresExpert",
  ],
};

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
    isArchived: false,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  return plant;
};

const getPlantImage = async (userId, plantId, imageId) => {
  validateObjectId(imageId, "image ID");

  const image = await PlantImage.findOne({
    _id: imageId,
    plant: plantId,
    user: userId,
    imageType: { $in: ["diagnosis", "general"] },
  });

  if (!image) {
    throw new ApiError(
      404,
      "Plant image not found or is not available for diagnosis."
    );
  }

  return image;
};

const downloadImageAsBase64 = async (imageUrl) => {
  let response;

  try {
    response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
  } catch (error) {
    console.error("Diagnosis image download failed:", error.message);
    throw new ApiError(
      502,
      "Unable to retrieve the plant image. Please upload it again."
    );
  }

  if (!response.ok) {
    throw new ApiError(
      502,
      "Unable to retrieve the plant image."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const mimeType = contentType.split(";")[0].trim().toLowerCase();

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(mimeType)) {
    throw new ApiError(
      400,
      "The selected image must be JPEG, PNG, or WebP."
    );
  }

  const contentLength = Number(
    response.headers.get("content-length") || 0
  );

  if (contentLength > 5 * 1024 * 1024) {
    throw new ApiError(
      413,
      "The image is too large for diagnosis."
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    throw new ApiError(
      400,
      "The image is empty or exceeds the 5 MB limit."
    );
  }

  return {
    imageBase64: buffer.toString("base64"),
    mimeType,
  };
};

const normalizeDiagnosis = (result) => {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    throw new ApiError(
      502,
      "The AI returned an invalid diagnosis response."
    );
  }

  const confidence = Number(result.confidence);

  if (
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    throw new ApiError(
      502,
      "The AI returned an invalid confidence score."
    );
  }

  const allowedHealthStatuses = Object.values(
    DIAGNOSIS_HEALTH_STATUS
  );

  if (!allowedHealthStatuses.includes(result.healthStatus)) {
    throw new ApiError(
      502,
      "The AI returned an invalid health status."
    );
  }

  const stringArray = (value, fieldName, maxItems = 12) => {
    if (
      !Array.isArray(value) ||
      value.length > maxItems ||
      value.some(
        (item) =>
          typeof item !== "string" ||
          !item.trim()
      )
    ) {
      throw new ApiError(
        502,
        `The AI returned invalid ${fieldName}.`
      );
    }

    return value.map((item) => item.trim());
  };

  if (
    !Array.isArray(result.possibleCauses) ||
    result.possibleCauses.length > 8
  ) {
    throw new ApiError(
      502,
      "The AI returned invalid possible causes."
    );
  }

  const allowedLikelihoods = ["low", "medium", "high"];

  const possibleCauses = result.possibleCauses.map((cause) => {
    if (
      !cause ||
      typeof cause.name !== "string" ||
      !cause.name.trim() ||
      typeof cause.explanation !== "string" ||
      !cause.explanation.trim() ||
      !allowedLikelihoods.includes(cause.likelihood)
    ) {
      throw new ApiError(
        502,
        "The AI returned an invalid possible cause."
      );
    }

    return {
      name: cause.name.trim(),
      likelihood: cause.likelihood,
      explanation: cause.explanation.trim(),
      evidence: stringArray(
        cause.evidence,
        "cause evidence",
        8
      ),
    };
  });

  if (
    typeof result.overallAssessment !== "string" ||
    !result.overallAssessment.trim() ||
    typeof result.requiresExpert !== "boolean"
  ) {
    throw new ApiError(
      502,
      "The AI returned an incomplete diagnosis."
    );
  }

  const symptoms = stringArray(
    result.symptoms,
    "symptoms",
    DIAGNOSIS_LIMITS.MAX_SYMPTOMS
  );

  const recommendedActions = stringArray(
    result.recommendedActions,
    "recommended actions",
    12
  );

  const preventionTips = stringArray(
    result.preventionTips,
    "prevention tips",
    12
  );

  return {
    symptoms,
    overallAssessment: result.overallAssessment.trim(),
    healthStatus:
      confidence < DIAGNOSIS_CONFIDENCE_THRESHOLD
        ? DIAGNOSIS_HEALTH_STATUS.UNCERTAIN
        : result.healthStatus,
    confidence,
    possibleCauses,
    recommendedActions,
    preventionTips,
    requiresExpert:
      result.requiresExpert ||
      confidence < DIAGNOSIS_CONFIDENCE_THRESHOLD,
    status:
      confidence < DIAGNOSIS_CONFIDENCE_THRESHOLD
        ? DIAGNOSIS_STATUS.LOW_CONFIDENCE
        : DIAGNOSIS_STATUS.COMPLETED,
  };
};

const diagnosePlant = async ({
  userId,
  plantId,
  imageId,
  symptoms = [],
}) => {
  const plant = await verifyPlantOwnership(userId, plantId);

  const image = await getPlantImage(
    userId,
    plantId,
    imageId
  );

  const { imageBase64, mimeType } =
    await downloadImageAsBase64(image.imageUrl);

  const prompt = [
    "Assess the visible health condition of this plant using the image.",
    "Do not claim a disease is confirmed from an image alone.",
    "Consider the plant's known identity and the user's reported symptoms.",
    "Separate visible observations from possible causes.",
    "If the image is unclear or evidence is insufficient, use low confidence and healthStatus uncertain.",
    "Do not recommend dangerous chemical mixtures or unverified treatments.",
    "Prefer safe, practical steps such as checking soil moisture, light, drainage, pests, and affected leaves.",
    "Mention when expert assessment is advisable.",
    "",
    `Plant name: ${plant.name}`,
    `Species: ${plant.species || "Unknown"}`,
    `Scientific name: ${plant.scientificName || "Unknown"}`,
    `Growing location: ${plant.location || "Not provided"}`,
    `Light condition: ${plant.lightCondition || "Unknown"}`,
    `Indoor/outdoor: ${plant.indoorOutdoor || "Unknown"}`,
    `Care notes: ${plant.careNotes || "None provided"}`,
    `User-reported symptoms: ${symptoms.length ? symptoms.join("; ") : "None provided"}`,
    "",
    "Return a structured assessment. Confidence must be a number between 0 and 1.",
    "Likelihood describes the plausibility of each possible cause, not a confirmed probability.",
  ].join("\n");

  const aiResult = await generateFromImage({
    input: prompt,
    imageBase64,
    mimeType,
    schema: DIAGNOSIS_SCHEMA,
    systemInstruction:
      "You are a cautious plant-health assistant. Provide evidence-based visual observations, communicate uncertainty, and never present an image-based assessment as a definitive laboratory diagnosis.",
    temperature: 0.2,
    maxOutputTokens: 4096,
    thinkingLevel: "low",
  });

  const normalized = normalizeDiagnosis(aiResult.data);

  const diagnosis = await Diagnosis.create({
    plant: plant._id,
    user: userId,
    image: image._id,
    ...normalized,
    model: aiResult.model,
    interactionId: aiResult.interactionId || null,
  });

  return diagnosis;
};

const getDiagnosisById = async (
  userId,
  plantId,
  diagnosisId
) => {
  validateObjectId(diagnosisId, "diagnosis ID");

  await verifyPlantOwnership(userId, plantId);

  const diagnosis = await Diagnosis.findOne({
    _id: diagnosisId,
    plant: plantId,
    user: userId,
  }).populate("image", "imageUrl caption imageType createdAt");

  if (!diagnosis) {
    throw new ApiError(404, "Diagnosis not found.");
  }

  return diagnosis;
};

const getDiagnosisHistory = async (
  userId,
  plantId,
  options = {}
) => {
  await verifyPlantOwnership(userId, plantId);

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(
    DIAGNOSIS_LIMITS.MAX_RESULTS_PER_PAGE,
    Math.max(1, Number(options.limit) || DIAGNOSIS_LIMITS.DEFAULT_PAGE_SIZE)
  );

  const filter = {
    plant: plantId,
    user: userId,
  };

  const [diagnoses, total] = await Promise.all([
    Diagnosis.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("image", "imageUrl caption imageType createdAt")
      .exec(),
    Diagnosis.countDocuments(filter),
  ]);

  return {
    diagnoses,
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
  diagnosePlant,
  getDiagnosisById,
  getDiagnosisHistory,
};
