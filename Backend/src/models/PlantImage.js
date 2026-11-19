const mongoose = require("mongoose");

const plantImageSchema = new mongoose.Schema(
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
      required: [true, "Image owner is required"],
      index: true,
    },

    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Image public ID is required"],
      trim: true,
    },

    resourceType: {
      type: String,
      default: "image",
      trim: true,
    },

    format: {
      type: String,
      default: null,
      trim: true,
    },

    width: {
      type: Number,
      default: null,
      min: [1, "Image width must be greater than 0"],
    },

    height: {
      type: Number,
      default: null,
      min: [1, "Image height must be greater than 0"],
    },

    bytes: {
      type: Number,
      default: null,
      min: [0, "Image size cannot be negative"],
    },

    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Caption cannot exceed 500 characters"],
    },

    imageType: {
      type: String,
      enum: {
        values: [
          "profile",
          "identification",
          "diagnosis",
          "growth",
          "general",
        ],
        message: "Invalid image type",
      },
      default: "general",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

plantImageSchema.index({
  plant: 1,
  createdAt: -1,
});

plantImageSchema.index({
  user: 1,
  createdAt: -1,
});

plantImageSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    plant: this.plant,
    user: this.user,
    imageUrl: this.imageUrl,
    publicId: this.publicId,
    resourceType: this.resourceType,
    format: this.format,
    width: this.width,
    height: this.height,
    bytes: this.bytes,
    caption: this.caption,
    imageType: this.imageType,
    isPrimary: this.isPrimary,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const PlantImage = mongoose.model("PlantImage", plantImageSchema);

module.exports = PlantImage;