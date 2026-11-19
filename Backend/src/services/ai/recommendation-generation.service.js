
const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const CareLog = require("../../models/CareLog");
const Recommendation = require("../../models/Recommendation");

const ApiError = require("../../utils/ApiError");

const { generateStructured } = require("./gemini.service");

const RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: [
              "watering",
              "fertilizing",
              "lighting",
              "temperature",
              "humidity",
              "soil",
              "repotting",
              "pruning",
              "pest_control",
              "disease_treatment",
              "general_care",
              "other",
            ],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          title: { type: "string" },
          message: { type: "string" },
          action: { type: "string" },
          reason: { type: "string" },
          confidence: { type: "number" },
          evidence: {
            type: "array",
            items: { type: "string" },
          },
          validityDays: { type: "integer" },
        },
        required: [
          "category",
          "priority",
          "title",
          "message",
          "action",
          "reason",
          "confidence",
          "evidence",
          "validityDays",
        ],
      },
    },
  },
  required: ["recommendations"],
};

const validateObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }
};

const generatePlantRecommendations = async ({
  userId,
  plantId,
}) => {
  validateObjectId(userId, "user ID");
  validateObjectId(plantId, "plant ID");

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
    isArchived: false,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  const recentCareLogs = await CareLog.find({
    plant: plant._id,
    user: userId,
  })
    .sort({ actionDate: -1, createdAt: -1 })
    .limit(20)
    .lean();

  const careHistory = recentCareLogs.map((log) => ({
    actionType: log.actionType,
    actionDate: log.actionDate,
    quantity: log.quantity,
    quantityUnit: log.quantityUnit,
    notes: log.notes,
  }));

  const prompt = [
    "Generate practical, personalized plant-care recommendations.",
    "Use only the supplied plant details and care history as known facts.",
    "Do not invent environmental measurements, symptoms, or care actions.",
    "If information is missing, acknowledge uncertainty and prefer safe, conservative advice.",
    "Avoid recommending unnecessary watering, fertilizing, repotting, or chemical treatment.",
    "Do not diagnose a disease without supporting evidence.",
    "Return between 3 and 6 distinct, actionable recommendations.",
    "Use confidence values between 0 and 1.",
    "Set validityDays to an integer from 1 to 30.",
    "Keep titles concise and actions specific.",
    "",
    "PLANT DETAILS:",
    JSON.stringify({
      name: plant.name,
      nickname: plant.nickname,
      species: plant.species,
      scientificName: plant.scientificName,
      category: plant.category,
      location: plant.location,
      lightCondition: plant.lightCondition,
      indoorOutdoor: plant.indoorOutdoor,
      wateringFrequency: plant.wateringFrequency,
      fertilizingFrequency: plant.fertilizingFrequency,
      careNotes: plant.careNotes,
      healthStatus: plant.healthStatus,
      healthScore: plant.healthScore,
    }),
    "",
    "RECENT CARE HISTORY:",
    JSON.stringify(careHistory),
  ].join("\n");

  const aiResult = await generateStructured({
    input: prompt,
    schema: RECOMMENDATION_SCHEMA,
    systemInstruction:
      "You are a cautious horticultural assistant. Give practical, evidence-aware care advice and clearly distinguish known facts from assumptions.",
    temperature: 0.2,
    maxOutputTokens: 4096,
    thinkingLevel: "low",
  });

  const generated = aiResult.data?.recommendations;

  if (
    !Array.isArray(generated) ||
    generated.length < 3 ||
    generated.length > 6
  ) {
    throw new ApiError(
      502,
      "The AI returned an invalid recommendation set."
    );
  }

  const allowedCategories = [
    "watering",
    "fertilizing",
    "lighting",
    "temperature",
    "humidity",
    "soil",
    "repotting",
    "pruning",
    "pest_control",
    "disease_treatment",
    "general_care",
    "other",
  ];

  const allowedPriorities = [
    "low",
    "medium",
    "high",
    "critical",
  ];

  const recommendationsToSave = generated.map((item) => {
    if (
      !item ||
      !allowedCategories.includes(item.category) ||
      !allowedPriorities.includes(item.priority) ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      typeof item.message !== "string" ||
      !item.message.trim() ||
      typeof item.action !== "string" ||
      typeof item.reason !== "string" ||
      !Number.isFinite(item.confidence) ||
      item.confidence < 0 ||
      item.confidence > 1 ||
      !Array.isArray(item.evidence) ||
      item.evidence.some(
        (entry) =>
          typeof entry !== "string" || !entry.trim()
      ) ||
      !Number.isInteger(item.validityDays) ||
      item.validityDays < 1 ||
      item.validityDays > 30
    ) {
      throw new ApiError(
        502,
        "The AI returned an invalid recommendation."
      );
    }

    return {
      plant: plant._id,
      user: userId,
      source: "ai",
      category: item.category,
      priority: item.priority,
      title: item.title.trim().slice(0, 200),
      message: item.message.trim().slice(0, 2000),
      action: item.action.trim().slice(0, 1000),
      reason: item.reason.trim().slice(0, 2000),
      confidence: item.confidence,
      evidence: item.evidence.map((entry) => entry.trim()),
      status: "active",
      expiresAt: new Date(
        Date.now() + item.validityDays * 24 * 60 * 60 * 1000
      ),
      metadata: {
        model: aiResult.model,
        interactionId: aiResult.interactionId || null,
        generatedAt: new Date(),
      },
    };
  });

  const savedRecommendations =
    await Recommendation.insertMany(recommendationsToSave);

  return {
    recommendations: savedRecommendations,
    model: aiResult.model,
    generatedAt: new Date(),
  };
};

module.exports = {
  generatePlantRecommendations,
};
