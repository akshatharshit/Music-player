import express from 'express';
import * as libraryController from '../controllers/libraryController.js';

const router = express.Router();

// Create a new playlist
router.post('/', libraryController.createLibrary);

// Get list of all playlists
router.get('/', libraryController.getAllLibraries);

// Get a specific playlist (and see the songs inside)
router.get('/:id', libraryController.getLibraryById);

// Add a song to a playlist
// Body expected: { "libraryId": "...", "songId": "..." }
router.post('/add-song', libraryController.addSongToLibrary);

export default router;