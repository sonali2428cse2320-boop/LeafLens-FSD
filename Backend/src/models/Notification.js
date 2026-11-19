const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: [
          "watering_reminder",
          "fertilizing_reminder",
          "care_reminder",
          "health_alert",
          "growth_update",
          "ai_insight",
          "system",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Notification title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Notification message cannot exceed 1000 characters"],
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    scheduledFor: {
      type: Date,
      default: null,
      index: true,
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

notificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  scheduledFor: 1,
});

notificationSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    user: this.user,
    plant: this.plant,
    type: this.type,
    title: this.title,
    message: this.message,
    isRead: this.isRead,
    readAt: this.readAt,
    scheduledFor: this.scheduledFor,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;