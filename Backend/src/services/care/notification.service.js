const mongoose = require("mongoose");

const Notification = require("../../models/Notification");
const Plant = require("../../models/Plant");
const ApiError = require("../../utils/ApiError");

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

const createNotification = async (
  userId,
  notificationData
) => {
  if (
    notificationData.plant !== null &&
    notificationData.plant !== undefined
  ) {
    validateObjectId(
      notificationData.plant,
      "plant ID"
    );

    const plant = await Plant.findOne({
      _id: notificationData.plant,
      user: userId,
    });

    if (!plant) {
      throw new ApiError(
        404,
        "Plant not found."
      );
    }
  }

  const notification = await Notification.create({
    ...notificationData,
    user: userId,
  });

  return notification;
};

const getUserNotifications = async (
  userId,
  options = {}
) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  if (type) {
    filter.type = type;
  }

  const [notifications, total, unreadCount] =
    await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        user: userId,
        isRead: false,
      }),
    ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getNotificationById = async (
  userId,
  notificationId
) => {
  validateObjectId(
    notificationId,
    "notification ID"
  );

  const notification =
    await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found."
    );
  }

  return notification;
};

const markNotificationAsRead = async (
  userId,
  notificationId
) => {
  validateObjectId(
    notificationId,
    "notification ID"
  );

  const notification =
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found."
    );
  }

  return notification;
};

const markAllNotificationsAsRead = async (
  userId
) => {
  const result =
    await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

  return {
    modifiedCount: result.modifiedCount,
  };
};

const deleteNotification = async (
  userId,
  notificationId
) => {
  validateObjectId(
    notificationId,
    "notification ID"
  );

  const notification =
    await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found."
    );
  }

  return notification;
};

module.exports = {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};