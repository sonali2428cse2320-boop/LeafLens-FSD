const Plant = require("../models/Plant");
const PlantImage = require("../models/PlantImage");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const {
  uploadImage,
  deleteImage,
} = require("../services/storage/image.service");

const uploadPlantImage = asyncHandler(async (req, res) => {
  const { plantId } = req.params;

  if (!req.file) {
    throw new ApiError(400, "Image file is required.");
  }

  const plant = await Plant.findOne({
    _id: plantId,
    user: req.user._id,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  const uploadedImage = await uploadImage(
    req.file.buffer,
    {
      folder: `leaflens/plants/${plantId}`,
    }
  );

  try {
    const plantImage = await PlantImage.create({
      plant: plant._id,
      user: req.user._id,
      imageUrl: uploadedImage.imageUrl,
      publicId: uploadedImage.publicId,
      resourceType: uploadedImage.resourceType,
      format: uploadedImage.format,
      width: uploadedImage.width,
      height: uploadedImage.height,
      bytes: uploadedImage.bytes,
      imageType: "general",
    });

    res.status(201).json(
      new ApiResponse(
        201,
        "Plant image uploaded successfully.",
        {
          image: plantImage.toSafeObject(),
        }
      )
    );
  } catch (error) {
    // MongoDB failed after Cloudinary succeeded.
    // Clean up the orphaned Cloudinary image.
    try {
      await deleteImage(uploadedImage.publicId);
    } catch (cleanupError) {
      console.error(
        "❌ Failed to clean up orphaned Cloudinary image:",
        cleanupError.message
      );
    }

    throw error;
  }
});

const getPlantImages = asyncHandler(async (req, res) => {
  const { plantId } = req.params;

  const plant = await Plant.findOne({
    _id: plantId,
    user: req.user._id,
  });

  if (!plant) {
    throw new ApiError(404, "Plant not found.");
  }

  const images = await PlantImage.find({
    plant: plant._id,
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Plant images retrieved successfully.",
      {
        images: images.map((image) =>
          image.toSafeObject()
        ),
      }
    )
  );
});

const deletePlantImage = asyncHandler(async (req, res) => {
  const { plantId, imageId } = req.params;

  const image = await PlantImage.findOne({
    _id: imageId,
    plant: plantId,
    user: req.user._id,
  });

  if (!image) {
    throw new ApiError(404, "Plant image not found.");
  }

  await deleteImage(image.publicId);

  await image.deleteOne();

  res.status(200).json(
    new ApiResponse(
      200,
      "Plant image deleted successfully.",
      null
    )
  );
});

module.exports = {
  uploadPlantImage,
  getPlantImages,
  deletePlantImage,
};