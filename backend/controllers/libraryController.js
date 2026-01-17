import Library from '../models/Library.js';

// 1. CREATE A NEW LIBRARY (Updated to accept songs & description)
export const createLibrary = async (req, res) => {
  try {
    // Destructure all fields from the request
    const { name, creator, coverUrl, description, songs } = req.body;

    const newLib = new Library({
      name: name,
      creator: creator || "Anonymous",
      coverUrl: coverUrl,
      description: description || "", // Save description
      songs: songs || []            // Save selected songs (or empty array)
    });
    
    await newLib.save();
    res.status(201).json(newLib);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create library" });
  }
};

// 2. GET ALL LIBRARIES (Just the summaries)
export const getAllLibraries = async (req, res) => {
  try {
    const libs = await Library.find().sort({ visits: -1 }); // Most visited first
    res.json(libs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET ONE LIBRARY (And increment visits)
export const getLibraryById = async (req, res) => {
  try {
    // A. Find and update visit count
    const library = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { visits: 1 } },
      { new: true }
    ).populate('songs'); // <--- CRITICAL: This turns song IDs into full song objects

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

    // Prevent duplicates
    if (library.songs.includes(songId)) {
      return res.status(400).json({ error: "Song already in library" });
    }

    library.songs.push(songId);
    await library.save();
    
    // Optional: Populate the songs before returning so the UI updates instantly with details
    await library.populate('songs');

    res.json(library);
  } catch (err) {
    res.status(500).json({ error: "Could not add song" });
  }
};