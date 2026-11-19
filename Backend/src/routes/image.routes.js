const express = require("express");

const {
  uploadPlantImage,
  getPlantImages,
  deletePlantImage,
} = require("../controllers/image.controller");

const authenticate = require("../middleware/auth.middleware");
const {
  uploadPlantImage: uploadImageMiddleware,
} = require("../middleware/upload.middleware");

const router = express.Router();

// All image routes require authentication.
router.use(authenticate);

// Upload an image for a plant.
router.post(
  "/plants/:plantId/images",
  uploadImageMiddleware,
  uploadPlantImage
);

// Get all images belonging to a plant.
router.get(
  "/plants/:plantId/images",
  getPlantImages
);

// Delete a specific plant image.
router.delete(
  "/plants/:plantId/images/:imageId",
  deletePlantImage
);

module.exports = router;