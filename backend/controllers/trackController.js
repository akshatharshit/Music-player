import Track from '../models/Track.js';
import { cloudinary } from '../config/cloudinary.js';

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

    const newTrack = new Track({
      title: req.body.title,
      artist: req.body.artist,
      duration: req.body.duration || 0,
      
      // Cloudinary returns 'path' as the secure URL
      audio: {
        url: audioFile.path, 
        public_id: audioFile.filename
      },
      coverImage: {
        url: coverFile.path,
        public_id: coverFile.filename
      },
      theme: {
        primary: req.body.themePrimary,
        secondary: req.body.themeSecondary
      }
    });

    await newTrack.save();
    res.status(201).json(newTrack);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// 3. DELETE TRACK
export const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    // Delete assets from Cloudinary
    if (track.coverImage.public_id) {
        await cloudinary.uploader.destroy(track.coverImage.public_id);
    }
    if (track.audio.public_id) {
        // Audio is stored as 'video' resource_type in Cloudinary
        await cloudinary.uploader.destroy(track.audio.public_id, { resource_type: 'video' });
    }

    // Delete from DB
    await track.deleteOne();
    res.json({ message: "Track deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// 4. INCREMENT PLAY COUNT
export const playTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } }, // Increment plays by 1
      { new: true }
    );
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: "Could not count play" });
  }
};