import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for streaming
const upload = multer({ storage: multer.memoryStorage() });

// Our unified upload function (replaces CloudinaryStorage)
const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const isAudio = req.file.mimetype.startsWith("audio");

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "music-app",
          resource_type: isAudio ? "video" : "image",
          public_id: `${req.file.fieldname}-${Date.now()}`,
          format: isAudio ? "mp3" : "png"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    req.cloudinaryResult = result; // attach to request for controller or next handler
    next();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
};

export { upload, handleUpload, cloudinary };
