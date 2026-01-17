import express from 'express';
// 1. Import the middleware we created (Fixes the path issue)
import upload from '../middleware/upload.js'; 
import * as trackController from '../controllers/trackController.js';

const router = express.Router();

// GET all tracks
router.get('/', trackController.getAllTracks);

// UPLOAD a new track
// We use '/add' to be specific.
// The keys 'audio' and 'cover' MUST match your Frontend FormData.
router.post('/add', 
  upload.fields([
    { name: 'audio', maxCount: 1 }, 
    { name: 'cover', maxCount: 1 }
  ]), 
  trackController.createTrack
);

// DELETE a track
router.delete('/:id', trackController.deleteTrack);

// PLAY (Increment count)
router.put('/:id/play', trackController.playTrack);

export default router;