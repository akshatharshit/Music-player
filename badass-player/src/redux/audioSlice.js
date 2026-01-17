import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTracks, incrementPlayCount, uploadTrack } from "../services/api";

// --- THUNKS (Async Actions) ---

// 1. Fetch all songs from Backend
export const getTracks = createAsyncThunk(
  'audio/getTracks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTracks();
      // FIXED: Since api.js already returns response.data, data IS the array
      return data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch tracks");
    }
  }
);

// 2. Report a "Play" to the backend
export const recordPlay = createAsyncThunk(
  'audio/recordPlay',
  async (id) => {
    // This updates the count on the server
    const data = await incrementPlayCount(id);
    return data; // Returns the updated track object
  }
);

// 3. Upload new song
export const uploadNewSong = createAsyncThunk(
  "audio/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await uploadTrack(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload failed");
    }
  }
);

// --- INITIAL STATE ---
const initialState = {
  tracks: [],
  loading: false,
  error: null,

  currentTrack: null,  
  isPlaying: false,    
  currentIndex: -1,    
};

// --- SLICE ---
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
      if (state.tracks && state.tracks.length > 0) {
        state.currentIndex = state.tracks.findIndex(t => t._id === action.payload._id);
      }
      state.isPlaying = true; 
    },

    togglePlay: (state, action) => {
      if (action.payload !== undefined) {
        state.isPlaying = action.payload;
      } else {
        state.isPlaying = !state.isPlaying;
      }
    },

    playNext: (state) => {
      if (state.tracks.length > 0) {
        if (state.currentIndex < state.tracks.length - 1) {
          state.currentIndex += 1;
        } else {
          state.currentIndex = 0; 
        }
        state.currentTrack = state.tracks[state.currentIndex];
        state.isPlaying = true;
      }
    },

    playPrev: (state) => {
      if (state.tracks.length > 0) {
        if (state.currentIndex > 0) {
          state.currentIndex -= 1;
        } else {
          state.currentIndex = state.tracks.length - 1; 
        }
        state.currentTrack = state.tracks[state.currentIndex];
        state.isPlaying = true;
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(getTracks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(uploadNewSong.fulfilled, (state, action) => {
        // Add the new song to the top of the list immediately
        if (action.payload) {
          state.tracks.unshift(action.payload);
        }
      })
      
      .addCase(recordPlay.fulfilled, (state, action) => {
        // Update the playCount locally in the track list for the "Top Charts"
        const index = state.tracks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tracks[index] = action.payload;
        }
      });
  }
});

export const { setCurrentTrack, togglePlay, playNext, playPrev } = audioSlice.actions;
export default audioSlice.reducer;