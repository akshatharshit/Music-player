import Library from '../models/Library.js';
import { cloudinary } from '../middleware/upload.js'; // <== from our fixed middleware

// 1. CREATE A NEW LIBRARY
export const createLibrary = async (req, res) => {
  try {
    const { name, creator, description, songs } = req.body;

    let coverUrl = "https://via.placeholder.com/150";

    // If the user uploaded a file (FormData)
    if (req.file && req.file.buffer) {
      const isAudio = req.file.mimetype.startsWith("audio");

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "music-app/library-covers",
            resource_type: isAudio ? "video" : "image"
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        ).end(req.file.buffer);
      });

      coverUrl = result.secure_url;
    }

    const newLib = new Library({
      name,
      creator: creator || "Anonymous",
      coverUrl,
      description: description || "",
      songs: Array.isArray(songs) ? songs : []
    });

    await newLib.save();
    await newLib.populate("songs");

    res.status(201).json(newLib);
  } catch (err) {
    console.error("Create Library Error:", err);
    res.status(500).json({ error: "Could not create library" });
  }
};


// 2. GET ALL LIBRARIES
export const getAllLibraries = async (req, res) => {
  try {
    const libs = await Library.find().sort({ visits: -1 });
    res.json(libs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET ONE LIBRARY (With Populated Songs)
export const getLibraryById = async (req, res) => {
  try {
    const library = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { visits: 1 } },
      { new: true }
    ).populate('songs'); 

    if (!library) return res.status(404).json({ error: "Library not found" });

    res.json(library);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. ADD SONG TO LIBRARY
export const addSongToLibrary = async (req, res) => {
  try {
    const { libraryId, songId } = req.body;
    
    const library = await Library.findById(libraryId);
    if (!library) return res.status(404).json({ error: "Library not found" });

    if (library.songs.includes(songId)) {
      return res.status(400).json({ error: "Song already in library" });
    }

    library.songs.push(songId);
    await library.save();
    
    // Return the updated library with song details
    await library.populate('songs');
    res.json(library);

  } catch (err) {
    res.status(500).json({ error: "Could not add song" });
  }
};