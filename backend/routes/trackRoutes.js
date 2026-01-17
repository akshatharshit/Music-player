import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import * as trackController from '../controllers/trackController.js';

const router = express.Router();

// Initialize Multer
const upload = multer({ storage });

// Routes
router.get('/', trackController.getAllTracks);

router.post('/', 
  upload.fields([{ name: 'audio' }, { name: 'cover' }]), 
  trackController.createTrack
);

router.delete('/:id', trackController.deleteTrack);

router.put('/:id/play', trackController.playTrack);

export default router;