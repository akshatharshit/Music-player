import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Check file type to determine resource_type
    const isAudio = file.mimetype.startsWith('audio');
    
    return {
      folder: 'music-app', // Folder in your Cloudinary Dashboard
      resource_type: isAudio ? 'video' : 'image', // Audio is 'video' in Cloudinary
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

export { cloudinary, storage };