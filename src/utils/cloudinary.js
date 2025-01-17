import { v2 as cloudinary } from "cloudinary";
import fs from "fs";  
import dotenv from "dotenv";
dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // console.log("localFilePath: ", localFilePath);
    // console.log("Cloudinary Config:");
    // console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    // console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
    // console.log(
    //   "API_SECRET:",
    //   process.env.CLOUDINARY_API_SECRET ? "******" : "MISSING"
    // );

    if (!localFilePath) {
      return null;
      // console.log("inside localFilePath");
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("error: ", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
  }
};

export { uploadOnCloudinary };
