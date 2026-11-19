const {
  processCareReminders,
} = require("./scheduler.service");

let schedulerInterval = null;

const SCHEDULER_INTERVAL_MS =
  60 * 60 * 1000;

const runScheduler = async () => {
  try {
    const result =
      await processCareReminders();

    console.log(
      `🌿 Care scheduler completed. Plants processed: ${result.processedPlants}`
    );

    const notificationsCreated =
      result.results.reduce(
        (total, item) =>
          total + item.notificationsCreated,
        0
      );

    console.log(
      `🔔 Notifications created: ${notificationsCreated}`
    );

    return result;
  } catch (error) {
    console.error(
      "❌ Care scheduler failed:",
      error.message
    );

    return null;
  }
};

const startScheduler = () => {
  if (schedulerInterval) {
    console.log(
      "⚠️ Care scheduler is already running."
    );

    return;
  }

  console.log(
    "⏰ Care scheduler started. Interval: 1 hour."
  );

  schedulerInterval = setInterval(
    runScheduler,
    SCHEDULER_INTERVAL_MS
  );
};

const stopScheduler = () => {
  if (!schedulerInterval) {
    return;
  }

  clearInterval(schedulerInterval);

  schedulerInterval = null;

  console.log(
    "⏰ Care scheduler stopped."
  );
};

module.exports = {
  runScheduler,
  startScheduler,
  stopScheduler,
};