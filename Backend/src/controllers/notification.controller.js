const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const notificationService = require("../services/care/notification.service");

const getNotifications = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 20,
        1
      ),
      100
    );

    const unreadOnly =
      req.query.unreadOnly === "true";

    const result =
      await notificationService.getUserNotifications(
        req.user._id,
        {
          page,
          limit,
          unreadOnly,
          type: req.query.type,
        }
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Notifications retrieved successfully.",
        {
          notifications:
            result.notifications.map(
              (notification) =>
                notification.toSafeObject()
            ),
          unreadCount: result.unreadCount,
          pagination: result.pagination,
        }
      )
    );
  }
);

const getNotificationById = asyncHandler(
  async (req, res) => {
    const notification =
      await notificationService.getNotificationById(
        req.user._id,
        req.params.notificationId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Notification retrieved successfully.",
        {
          notification:
            notification.toSafeObject(),
        }
      )
    );
  }
);

const markNotificationAsRead =
  asyncHandler(async (req, res) => {
    const notification =
      await notificationService.markNotificationAsRead(
        req.user._id,
        req.params.notificationId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "Notification marked as read.",
        {
          notification:
            notification.toSafeObject(),
        }
      )
    );
  });

const markAllNotificationsAsRead =
  asyncHandler(async (req, res) => {
    const result =
      await notificationService.markAllNotificationsAsRead(
        req.user._id
      );

    res.status(200).json(
      new ApiResponse(
        200,
        "All notifications marked as read.",
        {
          modifiedCount: result.modifiedCount,
        }
      )
    );
  });

const deleteNotification = asyncHandler(
  async (req, res) => {
    await notificationService.deleteNotification(
      req.user._id,
      req.params.notificationId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        "Notification deleted successfully.",
        null
      )
    );
  }
);

module.exports = {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};