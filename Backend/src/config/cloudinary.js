const { v2: cloudinary } = require("cloudinary");

const env = require("./env");

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const verifyCloudinaryConnection = async () => {
  try {
    await cloudinary.api.ping();

    console.log("☁️ Cloudinary connection verified.");

    return true;
  } catch (error) {
    console.error(
      "❌ Cloudinary connection failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  cloudinary,
  verifyCloudinaryConnection,
};