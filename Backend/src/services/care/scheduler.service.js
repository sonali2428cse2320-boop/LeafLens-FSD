const Plant = require("../../models/Plant");
const Notification = require("../../models/Notification");

const {
  createNotification,
} = require("./notification.service");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getLatestCareDate = async (
  plantId,
  actionType
) => {
  const CareLog = require("../../models/CareLog");

  const latestCareLog = await CareLog.findOne({
    plant: plantId,
    actionType,
  })
    .sort({
      actionDate: -1,
    })
    .lean();

  return latestCareLog?.actionDate || null;
};

const isCareDue = (
  latestCareDate,
  frequencyInDays,
  now = new Date()
) => {
  if (
    frequencyInDays === null ||
    frequencyInDays === undefined
  ) {
    return false;
  }

  if (frequencyInDays <= 0) {
    return false;
  }

  if (!latestCareDate) {
    return true;
  }

  const elapsedTime =
    now.getTime() -
    new Date(latestCareDate).getTime();

  const elapsedDays =
    elapsedTime / MS_PER_DAY;

  return elapsedDays >= frequencyInDays;
};

const hasRecentReminder = async (
  plantId,
  type,
  since
) => {
  const notification =
    await Notification.findOne({
      plant: plantId,
      type,
      createdAt: {
        $gte: since,
      },
    })
      .select("_id")
      .lean();

  return Boolean(notification);
};

const createCareReminder = async ({
  plant,
  actionType,
  frequencyInDays,
  notificationType,
  title,
  message,
  now,
}) => {
  if (
    !isCareDue(
      await getLatestCareDate(
        plant._id,
        actionType
      ),
      frequencyInDays,
      now
    )
  ) {
    return null;
  }

  const reminderWindowStart = new Date(
    now.getTime() -
      Math.max(
        frequencyInDays * MS_PER_DAY,
        MS_PER_DAY
      )
  );

  const alreadyExists =
    await hasRecentReminder(
      plant._id,
      notificationType,
      reminderWindowStart
    );

  if (alreadyExists) {
    return null;
  }

  return createNotification(
    plant.user,
    {
      plant: plant._id,
      type: notificationType,
      title,
      message,
      scheduledFor: now,
      metadata: {
        source: "care_scheduler",
        actionType,
        frequencyInDays,
      },
    }
  );
};

const processPlantReminders = async (
  plant,
  now = new Date()
) => {
  const createdNotifications = [];

  if (plant.wateringFrequency) {
    const notification =
      await createCareReminder({
        plant,
        actionType: "watering",
        frequencyInDays:
          plant.wateringFrequency,
        notificationType:
          "watering_reminder",
        title: `Water ${plant.name}`,
        message: `Your ${plant.name} may be due for watering.`,
        now,
      });

    if (notification) {
      createdNotifications.push(
        notification
      );
    }
  }

  if (plant.fertilizingFrequency) {
    const notification =
      await createCareReminder({
        plant,
        actionType: "fertilizing",
        frequencyInDays:
          plant.fertilizingFrequency,
        notificationType:
          "fertilizing_reminder",
        title: `Fertilize ${plant.name}`,
        message: `Your ${plant.name} may be due for fertilizing.`,
        now,
      });

    if (notification) {
      createdNotifications.push(
        notification
      );
    }
  }

  return createdNotifications;
};

const processCareReminders = async (
  now = new Date()
) => {
  const plants = await Plant.find({
    isArchived: false,
    $or: [
      {
        wateringFrequency: {
          $gt: 0,
        },
      },
      {
        fertilizingFrequency: {
          $gt: 0,
        },
      },
    ],
  }).lean();

  const results = [];

  for (const plant of plants) {
    try {
      const notifications =
        await processPlantReminders(
          plant,
          now
        );

      results.push({
        plantId: plant._id,
        notificationsCreated:
          notifications.length,
      });
    } catch (error) {
      console.error(
        `❌ Failed to process reminders for plant ${plant._id}:`,
        error.message
      );

      results.push({
        plantId: plant._id,
        notificationsCreated: 0,
        error: error.message,
      });
    }
  }

  return {
    processedPlants: plants.length,
    results,
  };
};

module.exports = {
  isCareDue,
  processPlantReminders,
  processCareReminders,
};