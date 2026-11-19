const mongoose = require("mongoose");

const Plant = require("../../models/Plant");
const PlantImage = require("../../models/PlantImage");
const Identification = require("../../models/Identification");

const ApiError = require("../../utils/ApiError");

const {
  generateFromImage,
} = require("./gemini.service");

const IDENTIFICATION_SCHEMA = {
  type: "object",
  properties: {
    identifiedName: {
      type: "string",
      description:
        "Common or recognized name of the identified plant.",
    },

    scientificName: {
      type: "string",
      description:
        "Scientific/binomial name of the identified plant.",
    },

    confidence: {
      type: "number",
      description:
        "Confidence score between 0 and 1.",
    },

    evidence: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "Visible characteristics supporting the identification.",
    },

    alternatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },

          scientificName: {
            type: "string",
          },

          confidence: {
            type: "number",
          },

          evidence: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: [
          "name",
          "confidence",
          "evidence",
        ],
      },
      description:
        "Other plausible plant identifications.",
    },
  },
  required: [
    "identifiedName",
    "scientificName",
    "confidence",
    "evidence",
    "alternatives",
  ],
};

const validateObjectId = (
  id,
  fieldName = "ID"
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      400,
      `Invalid ${fieldName}.`
    );
  }
};

const verifyPlantOwnership = async (
  userId,
  plantId
) => {
  validateObjectId(
    plantId,
    "plant ID"
  );

  const plant = await Plant.findOne({
    _id: plantId,
    user: userId,
    isArchived: false,
  });

  if (!plant) {
    throw new ApiError(
      404,
      "Plant not found."
    );
  }

  return plant;
};

const getPlantImage = async (
  userId,
  plantId,
  imageId
) => {
  validateObjectId(
    imageId,
    "image ID"
  );

  const image =
    await PlantImage.findOne({
      _id: imageId,
      plant: plantId,
      user: userId,
    });

  if (!image) {
    throw new ApiError(
      404,
      "Plant image not found."
    );
  }

  return image;
};

const downloadImageAsBase64 =
  async (imageUrl) => {
    try {
      const response =
        await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(
          `Image request failed with status ${response.status}.`
        );
      }

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.startsWith(
          "image/"
        )
      ) {
        throw new Error(
          "The provided URL did not return a valid image."
        );
      }

      const arrayBuffer =
        await response.arrayBuffer();

      const buffer = Buffer.from(
        arrayBuffer
      );

      if (!buffer.length) {
        throw new Error(
          "The image response was empty."
        );
      }

      return {
        base64:
          buffer.toString("base64"),
        mimeType:
          contentType.split(";")[0],
      };
    } catch (error) {
      console.error(
        "❌ Failed to download plant image:",
        error.message
      );

      throw new ApiError(
        502,
        "Unable to retrieve the plant image for AI analysis."
      );
    }
  };

const normalizeIdentificationResult =
  (data) => {
    const confidence =
      Number(data.confidence);

    if (
      !data.identifiedName ||
      typeof data.identifiedName !==
        "string"
    ) {
      throw new ApiError(
        502,
        "AI returned an invalid plant identification."
      );
    }

    if (
      Number.isNaN(confidence) ||
      confidence < 0 ||
      confidence > 1
    ) {
      throw new ApiError(
        502,
        "AI returned an invalid confidence score."
      );
    }

    const evidence =
      Array.isArray(data.evidence)
        ? data.evidence
            .filter(
              (item) =>
                typeof item === "string"
            )
            .slice(0, 10)
        : [];

    const alternatives =
      Array.isArray(
        data.alternatives
      )
        ? data.alternatives
            .filter(
              (item) =>
                item &&
                typeof item.name ===
                  "string"
            )
            .slice(0, 5)
            .map((item) => ({
              name: item.name.trim(),
              scientificName:
                typeof item.scientificName ===
                "string"
                  ? item.scientificName.trim()
                  : null,
              confidence:
                Math.min(
                  1,
                  Math.max(
                    0,
                    Number(
                      item.confidence
                    ) || 0
                  )
                ),
              evidence:
                Array.isArray(
                  item.evidence
                )
                  ? item.evidence
                      .filter(
                        (evidenceItem) =>
                          typeof evidenceItem ===
                          "string"
                      )
                      .slice(0, 5)
                  : [],
            }))
        : [];

    return {
      identifiedName:
        data.identifiedName.trim(),

      scientificName:
        typeof data.scientificName ===
        "string"
          ? data.scientificName.trim()
          : null,

      confidence,

      evidence,

      alternatives,
    };
  };

const identifyPlant = async ({
  userId,
  plantId,
  imageId,
}) => {
  const plant =
    await verifyPlantOwnership(
      userId,
      plantId
    );

  const image =
    await getPlantImage(
      userId,
      plantId,
      imageId
    );

  const {
    base64,
    mimeType,
  } = await downloadImageAsBase64(
    image.imageUrl
  );

  const result =
    await generateFromImage({
      input: `
Identify the plant shown in this image.

Plant context:
- User's plant name: ${plant.name}
- Existing species, if any: ${
        plant.species || "unknown"
      }
- Existing scientific name, if any: ${
        plant.scientificName ||
        "unknown"
      }

Instructions:
- Identify the plant as accurately as possible from visible characteristics.
- Do not blindly trust the existing plant information.
- Provide the most likely common name.
- Provide the scientific name when reasonably identifiable.
- Give a confidence score from 0 to 1.
- Explain the visible evidence supporting the identification.
- Provide up to 5 plausible alternatives when uncertainty exists.
- Do not diagnose disease or health problems in this request.
- If the image is insufficient for reliable identification, keep the confidence appropriately low.
      `.trim(),

      imageBase64: base64,

      mimeType,

      schema:
        IDENTIFICATION_SCHEMA,

      systemInstruction: `
You are LeafLens AI, a plant identification specialist.

Your task is strictly plant identification from images.

Prioritize:
1. Visible botanical characteristics.
2. Leaf shape and arrangement.
3. Stem characteristics.
4. Growth pattern.
5. Flower, fruit, or other visible structures when present.
6. Overall visual consistency.

Never invent visual evidence that cannot reasonably be observed.

Return only structured data matching the provided schema.
      `.trim(),

      temperature: 0.1,

      maxOutputTokens: 4096,

      thinkingLevel: "low",
    });

  const normalized =
    normalizeIdentificationResult(
      result.data
    );

  const status =
    normalized.confidence < 0.5
      ? "low_confidence"
      : "completed";

  const identification =
    await Identification.create({
      plant: plant._id,
      user: userId,
      image: image._id,
      identifiedName:
        normalized.identifiedName,
      scientificName:
        normalized.scientificName,
      confidence:
        normalized.confidence,
      evidence:
        normalized.evidence,
      alternatives:
        normalized.alternatives,
      model: result.model,
      interactionId:
        result.interactionId,
      status,
    });

  return identification;
};

const getIdentificationById =
  async (
    userId,
    plantId,
    identificationId
  ) => {
    validateObjectId(
      identificationId,
      "identification ID"
    );

    await verifyPlantOwnership(
      userId,
      plantId
    );

    const identification =
      await Identification.findOne({
        _id: identificationId,
        plant: plantId,
        user: userId,
      }).populate({
        path: "image",
        select:
          "imageUrl imageType caption createdAt",
      });

    if (!identification) {
      throw new ApiError(
        404,
        "Identification result not found."
      );
    }

    return identification;
  };

const getIdentificationHistory =
  async (
    userId,
    plantId,
    options = {}
  ) => {
    await verifyPlantOwnership(
      userId,
      plantId
    );

    const {
      page = 1,
      limit = 20,
    } = options;

    const skip =
      (page - 1) * limit;

    const filter = {
      plant: plantId,
      user: userId,
    };

    const [
      identifications,
      total,
    ] = await Promise.all([
      Identification.find(filter)
        .populate({
          path: "image",
          select:
            "imageUrl imageType caption createdAt",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Identification.countDocuments(
        filter
      ),
    ]);

    return {
      identifications,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
        hasNextPage:
          page * limit < total,
        hasPreviousPage:
          page > 1,
      },
    };
  };

module.exports = {
  identifyPlant,
  getIdentificationById,
  getIdentificationHistory,
};