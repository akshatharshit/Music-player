import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORTS: Make sure these filenames match exactly what is in your 'routes' folder
import trackRoutes from './routes/trackRoutes.js'; 
import libraryRoutes from './routes/libraryRoutes.js'; 

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // Handles JSON data (for text fields)
// Note: Multer (in your routes) will handle the file uploads automatically

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// ROUTES
// 1. Tracks (Upload, Play, Delete) -> http://localhost:5000/api/tracks
app.use('/api/tracks', trackRoutes);

// 2. Libraries/Playlists -> http://localhost:5000/api/libraries
app.use('/api/libraries', libraryRoutes);

// ROOT ENDPOINT (Health Check)
app.get('/', (req, res) => {
   res.send('Music API is running...');
});


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));