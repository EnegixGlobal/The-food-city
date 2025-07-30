import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//
// delete file on cloudinary
const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return null;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error while deleting file from cloudinary", error);
    return null;
  }
};

export {  deleteFromCloudinary };
