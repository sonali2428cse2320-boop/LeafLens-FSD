const multer = require("multer");

const ApiError = require("../utils/ApiError");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(
      new ApiError(
        400,
        "Invalid image format. Only JPEG, PNG, and WebP images are allowed."
      )
    );

    return;
  }

  callback(null, true);
};

const uploadPlantImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
}).single("image");

module.exports = {
  uploadPlantImage,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};