const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
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

    source: {
      type: String,
      enum: {
        values: [
          "manual",
          "ai",
          "diagnosis",
          "environment",
          "system",
        ],
        message: "Invalid recommendation source",
      },
      default: "system",
    },

    category: {
      type: String,
      enum: {
        values: [
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
        message: "Invalid recommendation category",
      },
      required: [true, "Recommendation category is required"],
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Invalid recommendation priority",
      },
      default: "medium",
    },

    title: {
      type: String,
      required: [true, "Recommendation title is required"],
      trim: true,
      maxlength: [
        200,
        "Recommendation title cannot exceed 200 characters",
      ],
    },

    message: {
      type: String,
      required: [true, "Recommendation message is required"],
      trim: true,
      maxlength: [
        2000,
        "Recommendation message cannot exceed 2000 characters",
      ],
    },

    action: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        1000,
        "Recommendation action cannot exceed 1000 characters",
      ],
    },

    reason: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        2000,
        "Recommendation reason cannot exceed 2000 characters",
      ],
    },

    confidence: {
      type: Number,
      default: null,
      min: [0, "Confidence cannot be below 0"],
      max: [1, "Confidence cannot exceed 1"],
    },

    evidence: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: [
          "active",
          "completed",
          "dismissed",
          "expired",
        ],
        message: "Invalid recommendation status",
      },
      default: "active",
      index: true,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    dismissedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

recommendationSchema.index({
  plant: 1,
  status: 1,
  createdAt: -1,
});

recommendationSchema.index({
  user: 1,
  status: 1,
  createdAt: -1,
});

recommendationSchema.index({
  expiresAt: 1,
});

recommendationSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    plant: this.plant,
    user: this.user,
    source: this.source,
    category: this.category,
    priority: this.priority,
    title: this.title,
    message: this.message,
    action: this.action,
    reason: this.reason,
    confidence: this.confidence,
    evidence: this.evidence,
    status: this.status,
    expiresAt: this.expiresAt,
    completedAt: this.completedAt,
    dismissedAt: this.dismissedAt,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Recommendation = mongoose.model(
  "Recommendation",
  recommendationSchema
);

module.exports = Recommendation;