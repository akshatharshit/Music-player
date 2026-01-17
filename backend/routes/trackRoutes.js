import express from 'express';
import upload from '../middleware/upload.js';
import * as trackController from '../controllers/trackController.js';

const router = express.Router();

// GET all tracks
router.get('/', trackController.getAllTracks);

// ADD / UPLOAD track
router.post(
  '/add',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  trackController.createTrack
);

// DELETE track
router.delete('/:id', trackController.deleteTrack);

// PLAY / increment play count
router.put('/:id/play', trackController.playTrack);

export default router;
