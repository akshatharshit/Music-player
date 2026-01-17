import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './audioSlice';
import libraryReducer from './librarySlice'; // Import the file we just made

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    library: libraryReducer, // Add it here
  },
});