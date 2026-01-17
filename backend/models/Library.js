import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  creator: { 
    type: String, 
    required: true,
    default: "Admin" 
  },
  
  // Array of ObjectIds linking to the 'Track' model
  songs: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Track' 
  }],

  // Analytics
  visits: { 
    type: Number, 
    default: 0 
  },

  // Optional: Add a cover image for the playlist itself
  coverUrl: { 
    type: String, 
    default: "" 
  },

  createdAt: { type: Date, default: Date.now }
});

const Library = mongoose.model('Library', LibrarySchema);
export default Library;