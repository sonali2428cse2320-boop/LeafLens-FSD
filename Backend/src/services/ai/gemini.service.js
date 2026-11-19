const { GoogleGenAI } = require("@google/genai");

const env = require("../../config/env");
const ApiError = require("../../utils/ApiError");

const client = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const DEFAULT_MODEL = env.GEMINI_MODEL;

const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;
const DEFAULT_THINKING_LEVEL = "low";

const generateText = async ({
  input,
  systemInstruction,
  model = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  thinkingLevel = DEFAULT_THINKING_LEVEL,
}) => {
  if (!input || typeof input !== "string") {
    throw new ApiError(
      400,
      "Gemini input must be a non-empty string."
    );
  }

  try {
    const interaction = await client.interactions.create({
      model,
      input,
      ...(systemInstruction
        ? {
            system_instruction: systemInstruction,
          }
        : {}),
      generation_config: {
        temperature,
        max_output_tokens: maxOutputTokens,
        thinking_level: thinkingLevel,
      },
      store: false,
    });

    if (
      !interaction ||
      interaction.status === "failed"
    ) {
      throw new Error(
        "Gemini interaction failed."
      );
    }

    if (
      interaction.status === "incomplete"
    ) {
      throw new Error(
        "Gemini interaction returned incomplete output."
      );
    }

    const text =
      interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return {
      text,
      interactionId:
        interaction.id || null,
      model:
        interaction.model || model,
      status:
        interaction.status || "completed",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "❌ Gemini text generation failed:",
      error.message
    );

    throw new ApiError(
      502,
      "AI service is temporarily unavailable. Please try again later."
    );
  }
};

const generateStructured = async ({
  input,
  schema,
  systemInstruction,
  model = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  thinkingLevel = DEFAULT_THINKING_LEVEL,
}) => {
  if (!input || typeof input !== "string") {
    throw new ApiError(
      400,
      "Gemini input must be a non-empty string."
    );
  }

  if (
    !schema ||
    typeof schema !== "object"
  ) {
    throw new ApiError(
      500,
      "A valid JSON schema is required for structured AI output."
    );
  }

  try {
    const interaction =
      await client.interactions.create({
        model,
        input,
        ...(systemInstruction
          ? {
              system_instruction:
                systemInstruction,
            }
          : {}),
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema,
        },
        generation_config: {
          temperature,
          max_output_tokens:
            maxOutputTokens,
          thinking_level: thinkingLevel,
        },
        store: false,
      });

    if (
      !interaction ||
      interaction.status === "failed"
    ) {
      throw new Error(
        "Gemini structured interaction failed."
      );
    }

    if (
      interaction.status === "incomplete"
    ) {
      throw new Error(
        "Gemini structured interaction returned incomplete output."
      );
    }

    const text =
      interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty structured response."
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(
        "❌ Gemini returned invalid JSON:",
        parseError.message
      );

      throw new Error(
        "Gemini returned invalid structured data."
      );
    }

    return {
      data,
      interactionId:
        interaction.id || null,
      model:
        interaction.model || model,
      status:
        interaction.status || "completed",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "❌ Gemini structured generation failed:",
      error.message
    );

    throw new ApiError(
      502,
      "AI service is temporarily unavailable. Please try again later."
    );
  }
};

const generateFromImage = async ({
  input,
  imageBase64,
  mimeType,
  schema,
  systemInstruction,
  model = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  thinkingLevel = DEFAULT_THINKING_LEVEL,
}) => {
  if (!input || typeof input !== "string") {
    throw new ApiError(
      400,
      "Gemini image prompt must be a non-empty string."
    );
  }

  if (
    !imageBase64 ||
    typeof imageBase64 !== "string"
  ) {
    throw new ApiError(
      400,
      "A base64 encoded image is required."
    );
  }

  if (!mimeType) {
    throw new ApiError(
      400,
      "Image MIME type is required."
    );
  }

  if (
    !schema ||
    typeof schema !== "object"
  ) {
    throw new ApiError(
      500,
      "A valid JSON schema is required for image analysis."
    );
  }

  try {
    const interaction =
      await client.interactions.create({
        model,
        input: [
          {
            type: "text",
            text: input,
          },
          {
            type: "image",
            data: imageBase64,
            mime_type: mimeType,
          },
        ],
        ...(systemInstruction
          ? {
              system_instruction:
                systemInstruction,
            }
          : {}),
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema,
        },
        generation_config: {
          temperature,
          max_output_tokens:
            maxOutputTokens,
          thinking_level: thinkingLevel,
        },
        store: false,
      });

    if (
      !interaction ||
      interaction.status === "failed"
    ) {
      throw new Error(
        "Gemini image interaction failed."
      );
    }

    if (
      interaction.status === "incomplete"
    ) {
      throw new Error(
        "Gemini image interaction returned incomplete output."
      );
    }

    const text =
      interaction.output_text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty image analysis response."
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(
        "❌ Gemini returned invalid image-analysis JSON:",
        parseError.message
      );

      throw new Error(
        "Gemini returned invalid image analysis data."
      );
    }

    return {
      data,
      interactionId:
        interaction.id || null,
      model:
        interaction.model || model,
      status:
        interaction.status || "completed",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "❌ Gemini image analysis failed:",
      error.message
    );

    throw new ApiError(
      502,
      "AI image analysis is temporarily unavailable. Please try again later."
    );
  }
};

module.exports = {
  generateText,
  generateStructured,
  generateFromImage,
};