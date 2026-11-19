const mongoose = require("mongoose");

const growthRecordSchema = new mongoose.Schema(
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

    recordedAt: {
      type: Date,
      required: [true, "Growth record date is required"],
      default: Date.now,
      index: true,
    },

    height: {
      type: Number,
      default: null,
      min: [0, "Height cannot be negative"],
    },

    heightUnit: {
      type: String,
      enum: {
        values: ["cm", "m", "in", "ft"],
        message: "Invalid height unit",
      },
      default: "cm",
    },

    width: {
      type: Number,
      default: null,
      min: [0, "Width cannot be negative"],
    },

    widthUnit: {
      type: String,
      enum: {
        values: ["cm", "m", "in", "ft"],
        message: "Invalid width unit",
      },
      default: "cm",
    },

    leafCount: {
      type: Number,
      default: null,
      min: [0, "Leaf count cannot be negative"],
      max: [100000, "Leaf count is too large"],
    },

    newLeaves: {
      type: Number,
      default: null,
      min: [0, "New leaf count cannot be negative"],
      max: [100000, "New leaf count is too large"],
    },

    healthScore: {
      type: Number,
      default: null,
      min: [0, "Health score cannot be below 0"],
      max: [100, "Health score cannot exceed 100"],
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Growth notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

growthRecordSchema.index({
  plant: 1,
  recordedAt: -1,
});

growthRecordSchema.index({
  user: 1,
  recordedAt: -1,
});

growthRecordSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    plant: this.plant,
    user: this.user,
    recordedAt: this.recordedAt,
    height: this.height,
    heightUnit: this.heightUnit,
    width: this.width,
    widthUnit: this.widthUnit,
    leafCount: this.leafCount,
    newLeaves: this.newLeaves,
    healthScore: this.healthScore,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const GrowthRecord = mongoose.model(
  "GrowthRecord",
  growthRecordSchema
);

module.exports = GrowthRecord;