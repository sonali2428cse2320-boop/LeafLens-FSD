const mongoose = require("mongoose");

const identificationCandidateSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      scientificName: {
        type: String,
        default: null,
        trim: true,
      },

      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
      },

      evidence: {
        type: [String],
        default: [],
      },
    },
    {
      _id: false,
    }
  );

const identificationSchema =
  new mongoose.Schema(
    {
      plant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
        required: [true, "Plant is required"],
        index: true,
      },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true,
      },

      image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlantImage",
        required: [true, "Identification image is required"],
      },

      identifiedName: {
        type: String,
        required: [true, "Identified plant name is required"],
        trim: true,
      },

      scientificName: {
        type: String,
        default: null,
        trim: true,
      },

      confidence: {
        type: Number,
        required: [true, "Identification confidence is required"],
        min: 0,
        max: 1,
      },

      evidence: {
        type: [String],
        default: [],
      },

      alternatives: {
        type: [identificationCandidateSchema],
        default: [],
      },

      model: {
        type: String,
        required: true,
        trim: true,
      },

      interactionId: {
        type: String,
        default: null,
        trim: true,
      },

      status: {
        type: String,
        enum: {
          values: [
            "completed",
            "failed",
            "low_confidence",
          ],
          message: "Invalid identification status",
        },
        default: "completed",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

identificationSchema.index({
  plant: 1,
  createdAt: -1,
});

identificationSchema.index({
  user: 1,
  createdAt: -1,
});

identificationSchema.index({
  image: 1,
});

identificationSchema.methods.toSafeObject =
  function () {
    return {
      id: this._id,
      plant: this.plant,
      user: this.user,
      image: this.image,
      identifiedName:
        this.identifiedName,
      scientificName:
        this.scientificName,
      confidence:
        this.confidence,
      evidence:
        this.evidence,
      alternatives:
        this.alternatives,
      model: this.model,
      interactionId:
        this.interactionId,
      status: this.status,
      createdAt:
        this.createdAt,
      updatedAt:
        this.updatedAt,
    };
  };

const Identification =
  mongoose.model(
    "Identification",
    identificationSchema
  );

module.exports = Identification;