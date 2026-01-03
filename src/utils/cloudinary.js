import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    return;
  }

  console.log("uploading on cloudinary >> ", localFilePath);
  const result = await cloudinary.uploader.upload(localFilePath, {
    folder: "Twitter",
    resource_type: "image",
  });

  // Remove file from local uploads folder
  fs.unlinkSync(localFilePath);

  if (!result) {
    console.log("Error while uploading avatar on cloudinary ", error);
    return null;
  }

  console.log("Uploaded to cloudinary successfully ", result.secure_url);
  return result.secure_url;
};
