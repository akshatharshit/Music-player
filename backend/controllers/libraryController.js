import Library from '../models/Library.js';

// 1. CREATE A NEW LIBRARY (Fixed for JSON payloads)
export const createLibrary = async (req, res) => {
  try {
    const { name, creator, description, songs } = req.body;

    // Logic: If you EVER decide to add a cover upload later, keep req.file check
    // But for now, we'll handle the JSON 'songs' array directly
    let coverUrl = "https://via.placeholder.com/150"; 
    if (req.file) {
      coverUrl = req.file.path; 
    }

    // Since we are sending JSON from the frontend, 'songs' is already an array.
    // We don't need JSON.parse() unless you are using FormData.
    const newLib = new Library({
      name: name,
      creator: creator || "Anonymous",
      coverUrl: coverUrl,
      description: description || "",
      songs: Array.isArray(songs) ? songs : [] 
    });
    
    await newLib.save();
    
    // Pro-tip: Populate immediately so the frontend has the song data
    await newLib.populate('songs');
    
    res.status(201).json(newLib);

  } catch (err) {
    console.error("Create Library Error:", err);
    res.status(500).json({ error: "Could not create library" });
  }
};

// 2. GET ALL LIBRARIES
export const getAllLibraries = async (req, res) => {
  try {
    // Sorting by visits helps show 'Trending' playlists
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
      { $inc: { visits: 1 } }, // Tracking popularity
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

    // Prevent duplicates
    if (library.songs.includes(songId)) {
      return res.status(400).json({ error: "Song already in library" });
    }

    library.songs.push(songId);
    await library.save();
    
    await library.populate('songs');
    res.json(library);

  } catch (err) {
    res.status(500).json({ error: "Could not add song" });
  }
};