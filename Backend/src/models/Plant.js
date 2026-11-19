const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema(
  {
    // Owner of the plant
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Plant owner is required"],
      index: true,
    },

    // Basic plant identity
    name: {
      type: String,
      required: [true, "Plant name is required"],
      trim: true,
      minlength: [1, "Plant name must be at least 1 character long"],
      maxlength: [100, "Plant name cannot exceed 100 characters"],
    },

    nickname: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Nickname cannot exceed 100 characters"],
    },

    species: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Species cannot exceed 150 characters"],
    },

    scientificName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Scientific name cannot exceed 150 characters"],
    },

    category: {
      type: String,
      default: "other",
      trim: true,
      lowercase: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    acquiredAt: {
      type: Date,
      default: null,
    },

    // Environment
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    lightCondition: {
      type: String,
      enum: {
        values: [
          "low",
          "indirect",
          "bright-indirect",
          "direct",
          "mixed",
          "unknown",
        ],
        message: "Invalid light condition",
      },
      default: "unknown",
    },

    indoorOutdoor: {
      type: String,
      enum: {
        values: ["indoor", "outdoor", "both", "unknown"],
        message: "Invalid indoor/outdoor value",
      },
      default: "unknown",
    },

    // Care configuration
    wateringFrequency: {
      type: Number,
      min: [0, "Watering frequency cannot be negative"],
      max: [365, "Watering frequency cannot exceed 365 days"],
      default: null,
    },

    fertilizingFrequency: {
      type: Number,
      min: [0, "Fertilizing frequency cannot be negative"],
      max: [365, "Fertilizing frequency cannot exceed 365 days"],
      default: null,
    },

    careNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Care notes cannot exceed 2000 characters"],
    },

    // Health information
    healthStatus: {
      type: String,
      enum: {
        values: ["healthy", "attention", "critical", "unknown"],
        message: "Invalid health status",
      },
      default: "unknown",
    },

    healthScore: {
      type: Number,
      min: [0, "Health score cannot be below 0"],
      max: [100, "Health score cannot exceed 100"],
      default: null,
    },

    // Allows users to archive plants without deleting their history.
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Useful for fetching a user's active plants efficiently.
plantSchema.index({
  user: 1,
  isArchived: 1,
  createdAt: -1,
});

// Safe API representation.
plantSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    user: this.user,
    name: this.name,
    nickname: this.nickname,
    species: this.species,
    scientificName: this.scientificName,
    category: this.category,
    description: this.description,
    acquiredAt: this.acquiredAt,
    location: this.location,
    lightCondition: this.lightCondition,
    indoorOutdoor: this.indoorOutdoor,
    wateringFrequency: this.wateringFrequency,
    fertilizingFrequency: this.fertilizingFrequency,
    careNotes: this.careNotes,
    healthStatus: this.healthStatus,
    healthScore: this.healthScore,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;