const express = require("express");

const {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  notificationIdSchema,
  notificationQuerySchema,
} = require("../validators/notification.validator");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  validate(
    notificationQuerySchema,
    "query"
  ),
  getNotifications
);

router.get(
  "/:notificationId",
  validate(
    notificationIdSchema,
    "params"
  ),
  getNotificationById
);

router.patch(
  "/:notificationId/read",
  validate(
    notificationIdSchema,
    "params"
  ),
  markNotificationAsRead
);

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

router.delete(
  "/:notificationId",
  validate(
    notificationIdSchema,
    "params"
  ),
  deleteNotification
);

module.exports = router;