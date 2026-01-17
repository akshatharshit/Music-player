import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  
  // Cloudinary Assets
  audio: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  coverImage: {
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  },

  // Visual Theme
  theme: {
    primary: { type: String, default: "#7c3aed" },
    secondary: { type: String, default: "#db2777" }
  },

  duration: { type: Number, default: 0 },
  
  // Analytics
  plays: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

const Track = mongoose.model('Track', TrackSchema);
export default Track;