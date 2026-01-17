import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer'; // <--- Added this
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
    // Check if it's an audio file
    const isAudio = file.mimetype.startsWith('audio');
    
    return {
      folder: 'music-app',
      // Cloudinary treats Audio as 'video' resource type
      resource_type: isAudio ? 'video' : 'image', 
      public_id: `${file.fieldname}-${Date.now()}`,
      // Optional: Force formats to avoid errors
      format: isAudio ? 'mp3' : 'png', 
    };
  },
});

// Create the middleware
const upload = multer({ storage: storage });

// Export the middleware (default) and cloudinary (named)
export default upload;
export { cloudinary };