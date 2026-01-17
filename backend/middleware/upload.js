import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "audio/mpeg", "audio/wav"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file format"), false);
    }
    cb(null, true);
  },
});

// 3. Attach Cloudinary Upload Helper
upload.cloudinaryUpload = async (file, folder = "music-app") => {
  if (!file) throw new Error("No file provided");

  const isAudio = file.mimetype.startsWith("audio");

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: isAudio ? "video" : "image",
        folder,
        format: isAudio ? "mp3" : undefined, // optional
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file.buffer);
  });
};

// Export both, just like your original middleware
export { cloudinary };
export default upload;
