import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import trackRoutes from './routes/trackRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/tracks', trackRoutes);
app.use('/api/libraries', libraryRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Routes
app.use('/api/tracks', trackRoutes);

// Root Endpoint (Optional check)
app.get('/', (req, res) => {
    res.send('Music API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));