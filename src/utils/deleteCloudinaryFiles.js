import {v2 as cloudinary} from "cloudinary"
import { ApiResponse } from "./ApiResponse";
import { ApiError } from "./ApiError";

const deleteColudinaryFile =async (url) =>{
  const parts = url.split("/");
  const versionIndex = parts.findIndex((part) => part.startsWith("v")); // Find the version index, e.g., 'v1621234567'
  const publicIdWithExtension = parts.slice(versionIndex + 1).join("/"); // Everything after the version
  const publicId = publicIdWithExtension.split(".")[0]; // Remove the file extension (e.g., .jpg)
  try {
    
    // Use Cloudinary's destroy method to delete the image by public_id
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      throw new ApiResponse(200, {}, "Image deleted successfully");
    } else {
      throw new ApiError(400, "Image not found or already deleted");
    }
  } catch (error) {
    throw new ApiError(400, "Image not found or already deleted");
  }
}

export { deleteColudinaryFile };