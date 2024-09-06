import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import { response } from "express";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KYE,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null;
        //file upload on cloudinary from local temp storage
        const response = await cloudinary.uploader.upload(localPath, {
          resource_type: "auto",
        });
        console.log("File uploded successfully", response.url)
        return response
        
    } catch (error) {
        // if file is not uploded on cloudinary then for safer way we have to unlink the file from or server
        fs.unlink(localPath)
        return null;
    }
}