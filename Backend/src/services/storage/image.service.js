const { cloudinary } = require("../../config/cloudinary");
const ApiError = require("../../utils/ApiError");

const uploadImage = async (
  buffer,
  {
    folder = "leaflens/plants",
    publicId = undefined,
  } = {}
) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new ApiError(
      400,
      "A valid image file is required."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        ...(publicId ? { public_id: publicId } : {}),
      },
      (error, result) => {
        if (error) {
          console.error(
            "❌ Cloudinary image upload failed:",
            error.message
          );

          reject(
            new ApiError(
              502,
              "Image upload failed. Please try again."
            )
          );

          return;
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId || typeof publicId !== "string") {
    throw new ApiError(
      400,
      "A valid image public ID is required."
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
        invalidate: true,
      }
    );

    if (
      result.result !== "ok" &&
      result.result !== "not found"
    ) {
      console.error(
        "❌ Cloudinary image deletion failed:",
        result
      );

      throw new ApiError(
        502,
        "Image deletion failed. Please try again."
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "❌ Cloudinary image deletion failed:",
      error.message
    );

    throw new ApiError(
      502,
      "Image deletion failed. Please try again."
    );
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};