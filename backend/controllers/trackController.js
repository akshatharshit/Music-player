import Track from '../models/Track.js';
// FIXED: Import cloudinary from the middleware file we created
import { cloudinary } from '../middleware/upload.js'; 

// 1. GET ALL TRACKS
export const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. UPLOAD TRACK
export const createTrack = async (req, res) => {
  try {
    if (!req.files || !req.files['audio'] || !req.files['cover']) {
      return res.status(400).json({ error: "Audio and Cover image are required" });
    }

    const audioFile = req.files['audio'][0];
    const coverFile = req.files['cover'][0];

    // AUDIO UPLOAD → Cloudinary treats audio as 'video' resource
    const audioResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "music-app/tracks",
          resource_type: "video",
          public_id: `audio-${Date.now()}`,
          format: "mp3"
        },
        (err, data) => err ? reject(err) : resolve(data)
      ).end(audioFile.buffer);
    });

    // COVER UPLOAD → normal image
    const coverResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "music-app/covers",
          resource_type: "image",
          public_id: `cover-${Date.now()}`,
          format: "png"
        },
        (err, data) => err ? reject(err) : resolve(data)
      ).end(coverFile.buffer);
    });

    // SAVE TO DB
    const newTrack = new Track({
      title: req.body.title,
      artist: req.body.artist,
      duration: req.body.duration || 0,
      playCount: 0,

      audio: {
        url: audioResult.secure_url,
        public_id: audioResult.public_id
      },
      coverImage: {
        url: coverResult.secure_url,
        public_id: coverResult.public_id
      },
      theme: {
        primary: req.body.themePrimary || "#ffffff",
        secondary: req.body.themeSecondary || "#000000"
      }
    });

    await newTrack.save();
    return res.status(201).json(newTrack);

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
};


// import Track from "../models/Track.js";
// import { cloudinary } from "../middleware/upload.js";

export const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    // 1. Delete COVER (Cloudinary treats it as image)
    if (track.coverImage?.public_id) {
      await cloudinary.uploader.destroy(track.coverImage.public_id, {
        resource_type: "image"
      });
    }

    // 2. Delete AUDIO (Cloudinary treats audio as video)
    if (track.audio?.public_id) {
      await cloudinary.uploader.destroy(track.audio.public_id, {
        resource_type: "video"
      });
    }

    // 3. Remove from DB
    await track.deleteOne();

    return res.json({ message: "Track deleted successfully" });

  } catch (err) {
    console.error("Delete Track Error:", err);
    return res.status(500).json({ error: "Delete failed", details: err.message });
  }
};


// 4. INCREMENT PLAY COUNT
export const playTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } }, // FIXED: Changed 'plays' to 'playCount' to match frontend
      { new: true }
    );
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: "Could not count play" });
  }
};