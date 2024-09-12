import {v2 as cloudinary} from "cloudinary"
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

const deleteColudinaryFile = async (url) =>{

      const parts = url.split("/");
      const versionIndex = parts.findIndex((part) => part.startsWith("v")); // Find the version index, e.g., 'v1621234567'
      const publicIdWithExtension = parts.slice(versionIndex + 1).join("/"); // Everything after the version
      const publicId = publicIdWithExtension.split(".")[0]; // Remove the file extension (e.g., .jpg)

      try {
        if (!publicId) {
          throw new ApiError(400, "publicId not available");
        }
        // Use Cloudinary's destroy method to delete the image by public_id
        const result = await cloudinary.uploader.destroy(publicId);
        return new ApiResponse(200,{},"image deleted successfull!")
      } catch (error) {
        throw new ApiError(
          400,
          "somethign went wrong while deleting the images"
        );
      }

}

export { deleteColudinaryFile };