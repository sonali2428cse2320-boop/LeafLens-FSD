
const mongoose = require("mongoose");

const diagnosisCauseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Cause name is required"],
      trim: true,
      maxlength: [200, "Cause name cannot exceed 200 characters"],
    },

    likelihood: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Invalid likelihood value",
      },
      required: true,
    },

    explanation: {
      type: String,
      required: [true, "Cause explanation is required"],
      trim: true,
      maxlength: [1500, "Explanation cannot exceed 1500 characters"],
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

const diagnosisSchema = new mongoose.Schema(
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
      required: [true, "Diagnosis image is required"],
    },

    symptoms: {
      type: [String],
      default: [],
    },

    overallAssessment: {
      type: String,
      required: [true, "Overall assessment is required"],
      trim: true,
      maxlength: [2000, "Assessment cannot exceed 2000 characters"],
    },

    healthStatus: {
      type: String,
      enum: {
        values: ["healthy", "mild", "moderate", "severe", "uncertain"],
        message: "Invalid diagnosis health status",
      },
      required: true,
    },

    confidence: {
      type: Number,
      required: [true, "Diagnosis confidence is required"],
      min: [0, "Confidence cannot be below 0"],
      max: [1, "Confidence cannot exceed 1"],
    },

    possibleCauses: {
      type: [diagnosisCauseSchema],
      default: [],
    },

    recommendedActions: {
      type: [String],
      default: [],
    },

    preventionTips: {
      type: [String],
      default: [],
    },

    requiresExpert: {
      type: Boolean,
      default: false,
    },

    disclaimer: {
      type: String,
      default:
        "This is an AI-generated assessment based on visible symptoms, not a definitive professional diagnosis.",
      maxlength: [500, "Disclaimer cannot exceed 500 characters"],
    },

    model: {
      type: String,
      required: [true, "AI model name is required"],
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
        values: ["completed", "low_confidence"],
        message: "Invalid diagnosis status",
      },
      default: "completed",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

diagnosisSchema.index({
  plant: 1,
  createdAt: -1,
});

diagnosisSchema.index({
  user: 1,
  createdAt: -1,
});

diagnosisSchema.index({
  image: 1,
});

diagnosisSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    plant: this.plant,
    user: this.user,
    image: this.image,
    symptoms: this.symptoms,
    overallAssessment: this.overallAssessment,
    healthStatus: this.healthStatus,
    confidence: this.confidence,
    possibleCauses: this.possibleCauses,
    recommendedActions: this.recommendedActions,
    preventionTips: this.preventionTips,
    requiresExpert: this.requiresExpert,
    disclaimer: this.disclaimer,
    model: this.model,
    interactionId: this.interactionId,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);

module.exports = Diagnosis;
