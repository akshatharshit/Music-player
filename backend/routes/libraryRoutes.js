import express from 'express';
import * as libraryController from '../controllers/libraryController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create library / playlist
router.post(
  '/',
  upload.single('coverImage'),
  libraryController.createLibrary
);

// List all
router.get('/', libraryController.getAllLibraries);

// Get one
router.get('/:id', libraryController.getLibraryById);

// Add song
router.post('/add-song', libraryController.addSongToLibrary);

export default router;
