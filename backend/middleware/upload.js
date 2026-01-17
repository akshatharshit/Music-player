import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Config Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-app', 
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp3', 'wav'], 
  },
});

const upload = multer({ storage });

// FIX: We need to export both the upload middleware AND the cloudinary config
export { cloudinary }; // This allows your Controller to delete files later
export default upload; // This allows your Routes to handle file uploads