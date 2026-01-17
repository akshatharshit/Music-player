import express from 'express';
import * as libraryController from '../controllers/libraryController.js';
// 1. IMPORT THE MIDDLEWARE
import upload from '../middleware/upload.js'; 

const router = express.Router();

// 2. INJECT MIDDLEWARE HERE
// We use 'upload.single' because a Playlist only has 1 image (no audio file)
// 'coverImage' must match the name in your Frontend FormData
router.post('/', upload.single('coverImage'), libraryController.createLibrary);

// Get list of all playlists
router.get('/', libraryController.getAllLibraries);

// Get a specific playlist
router.get('/:id', libraryController.getLibraryById);

// Add a song to a playlist
router.post('/add-song', libraryController.addSongToLibrary);

export default router;