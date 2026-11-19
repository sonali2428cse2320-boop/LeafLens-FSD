const mongoose = require("mongoose");

const careLogSchema = new mongoose.Schema(
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

    actionType: {
      type: String,
      enum: {
        values: [
          "watering",
          "fertilizing",
          "pruning",
          "repotting",
          "misting",
          "cleaning",
          "treatment",
          "sunlight",
          "pest_control",
          "other",
        ],
        message: "Invalid care action type",
      },
      required: [true, "Care action type is required"],
    },

    actionDate: {
      type: Date,
      required: [true, "Care action date is required"],
      default: Date.now,
      index: true,
    },

    quantity: {
      type: Number,
      default: null,
      min: [0, "Quantity cannot be negative"],
    },

    quantityUnit: {
      type: String,
      enum: {
        values: [
          "ml",
          "litre",
          "grams",
          "kg",
          "minutes",
          "hours",
          "none",
        ],
        message: "Invalid quantity unit",
      },
      default: "none",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Care notes cannot exceed 1000 characters"],
    },

    performedBy: {
      type: String,
      enum: {
        values: ["user", "system"],
        message: "Invalid performedBy value",
      },
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

careLogSchema.index({
  plant: 1,
  actionDate: -1,
});

careLogSchema.index({
  user: 1,
  actionDate: -1,
});

careLogSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    plant: this.plant,
    user: this.user,
    actionType: this.actionType,
    actionDate: this.actionDate,
    quantity: this.quantity,
    quantityUnit: this.quantityUnit,
    notes: this.notes,
    performedBy: this.performedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const CareLog = mongoose.model("CareLog", careLogSchema);

module.exports = CareLog;