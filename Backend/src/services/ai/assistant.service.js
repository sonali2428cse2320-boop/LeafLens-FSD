
const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const CareLog = require("../../models/CareLog");
const GrowthRecord = require("../../models/GrowthRecord");
const Diagnosis = require("../../models/Diagnosis");
const Recommendation = require("../../models/Recommendation");

const ApiError = require("../../utils/ApiError");
const { generateStructured } = require("./gemini.service");

const ASSISTANT_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
    },
    suggestedActions: {
      type: "array",
      items: {
        type: "string",
      },
    },
    followUpQuestions: {
      type: "array",
      items: {
        type: "string",
      },
    },
    safetyNote: {
      type: "string",
    },
  },
  required: [
    "answer",
    "suggestedActions",
    "followUpQuestions",
    "safetyNote",
  ],
};

const validateObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }
};

const getPlantAssistantResponse = async ({
  userId,
  plantId,
  message,
}) => {
  validateObjectId(userId, "user ID");
  validateObjectId(plantId, "plant ID");

  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "A message is required.");
  }

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
    isArchived: false,
  }).lean();

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  // Retrieve relevant information in parallel.
  const [
    careLogs,
    growthRecords,
    diagnoses,
    recommendations,
  ] = await Promise.all([
    CareLog.find({
      plant: plantId,
      user: userId,
    })
      .sort({ actionDate: -1 })
      .limit(10)
      .select("actionType actionDate quantity quantityUnit notes")
      .lean(),

    GrowthRecord.find({
      plant: plantId,
      user: userId,
    })
      .sort({ recordedAt: -1 })
      .limit(5)
      .select(
        "recordedAt height heightUnit width widthUnit leafCount newLeaves healthScore notes"
      )
      .lean(),

    Diagnosis.find({
      plant: plantId,
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "overallAssessment healthStatus confidence possibleCauses recommendedActions createdAt status"
      )
      .lean(),

    Recommendation.find({
      plant: plantId,
      user: userId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "category priority title message action reason confidence source"
      )
      .lean(),
  ]);

  const plantContext = {
    profile: {
      name: plant.name,
      nickname: plant.nickname,
      species: plant.species,
      scientificName: plant.scientificName,
      category: plant.category,
      description: plant.description,
      acquiredAt: plant.acquiredAt,
      location: plant.location,
      lightCondition: plant.lightCondition,
      indoorOutdoor: plant.indoorOutdoor,
      wateringFrequency: plant.wateringFrequency,
      fertilizingFrequency: plant.fertilizingFrequency,
      careNotes: plant.careNotes,
      healthStatus: plant.healthStatus,
      healthScore: plant.healthScore,
    },
    recentCareLogs: careLogs,
    recentGrowthRecords: growthRecords,
    recentDiagnoses: diagnoses,
    activeRecommendations: recommendations,
  };

  const prompt = [
    "USER QUESTION:",
    message.trim(),
    "",
    "AVAILABLE PLANT DATA:",
    JSON.stringify(plantContext),
    "",
    "INSTRUCTIONS:",
    "1. Answer the user's question directly and clearly.",
    "2. Personalize advice using the supplied plant profile and history.",
    "3. Treat the supplied records as evidence, not as proof of causation.",
    "4. Never invent observations, measurements, treatments, or care events.",
    "5. Distinguish recorded facts from general horticultural guidance.",
    "6. If important information is missing, acknowledge uncertainty.",
    "7. Avoid recommending watering or fertilizing without considering recent care.",
    "8. Do not claim a disease is confirmed from incomplete evidence.",
    "9. For possible disease or pest issues, recommend careful inspection and appropriate expert help when needed.",
    "10. Do not recommend unsafe chemical mixtures or unsupported treatments.",
    "11. Suggest only relevant, practical actions. An empty action list is acceptable.",
    "12. Keep follow-up questions focused on information needed to improve the advice.",
    "13. Use safetyNote for important cautions. If none are needed, return an empty string.",
    "14. Return the requested structured response only.",
  ].join("\n");

  const aiResult = await generateStructured({
    input: prompt,
    schema: ASSISTANT_SCHEMA,
    systemInstruction:
      "You are LeafLens AI, a careful and evidence-aware plant-care assistant. Give helpful, personalized horticultural guidance while being transparent about uncertainty. Never pretend to have inspected a plant or measured its environment unless the supplied data supports that claim.",
    temperature: 0.3,
    maxOutputTokens: 2048,
    thinkingLevel: "low",
  });

  const result = aiResult.data;

  if (
    !result ||
    typeof result.answer !== "string" ||
    !result.answer.trim() ||
    !Array.isArray(result.suggestedActions) ||
    !Array.isArray(result.followUpQuestions) ||
    typeof result.safetyNote !== "string" ||
    !result.suggestedActions.every(
      (item) => typeof item === "string"
    ) ||
    !result.followUpQuestions.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new ApiError(
      502,
      "The AI returned an invalid assistant response."
    );
  }

  return {
    plant: {
      id: plant._id,
      name: plant.name,
      species: plant.species,
    },
    answer: result.answer.trim(),
    suggestedActions: result.suggestedActions
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8),
    followUpQuestions: result.followUpQuestions
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
    safetyNote: result.safetyNote.trim(),
    contextUsed: {
      careLogs: careLogs.length,
      growthRecords: growthRecords.length,
      diagnoses: diagnoses.length,
      activeRecommendations: recommendations.length,
    },
    model: aiResult.model,
    interactionId: aiResult.interactionId || null,
    generatedAt: new Date(),
  };
};

module.exports = {
  getPlantAssistantResponse,
};
