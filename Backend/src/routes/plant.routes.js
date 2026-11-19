const express = require("express");

const {
  createPlant,
  getUserPlants,
  getPlantById,
  updatePlant,
  archivePlant,
  deletePlant,
} = require("../controllers/plant.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");

const {
  createPlantSchema,
  updatePlantSchema,
  plantIdSchema,
} = require("../validators/plant.validator");

const router = express.Router();

// All plant routes require authentication.
router.use(authenticate);

// Create a plant
router.post(
  "/",
  validate(createPlantSchema),
  createPlant
);

// Get all plants belonging to the authenticated user
router.get(
  "/",
  getUserPlants
);

// Get a specific plant
router.get(
  "/:plantId",
  validate(plantIdSchema, "params"),
  getPlantById
);

// Update a specific plant
router.patch(
  "/:plantId",
  validate(plantIdSchema, "params"),
  validate(updatePlantSchema),
  updatePlant
);

// Archive a specific plant
router.patch(
  "/:plantId/archive",
  validate(plantIdSchema, "params"),
  archivePlant
);

// Permanently delete a specific plant
router.delete(
  "/:plantId",
  validate(plantIdSchema, "params"),
  deletePlant
);

module.exports = router;