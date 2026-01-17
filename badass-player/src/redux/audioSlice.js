import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// FIX: Merged all API imports into a single line
import { fetchTracks, incrementPlayCount, uploadTrack } from "../services/api";

// --- THUNKS (Async Actions) ---

// 1. Fetch all songs from Backend
export const getTracks = createAsyncThunk(
  'audio/getTracks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchTracks();
      // FIX: Added optional chaining just in case response is undefined
      return response?.data || response; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch tracks");
    }
  }
);

// 2. Report a "Play" to the backend (for analytics)
export const recordPlay = createAsyncThunk(
  'audio/recordPlay',
  async (id) => {
    await incrementPlayCount(id);
    return id;
  }
);

// 3. Upload new song
export const uploadNewSong = createAsyncThunk(
  "audio/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await uploadTrack(formData);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload failed");
    }
  }
);

// --- INITIAL STATE ---
const initialState = {
  // Library Data
  tracks: [],
  loading: false,
  error: null,

  // Player State
  currentTrack: null,  // The song object currently selected
  isPlaying: false,    // Is audio actively running?
  currentIndex: -1,    // Position in the playlist
};

// --- SLICE ---
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    // A. Set the active song
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
      // Find the index of this song in our list (for Next/Prev logic)
      if (state.tracks && state.tracks.length > 0) {
        state.currentIndex = state.tracks.findIndex(t => t._id === action.payload._id);
      }
      state.isPlaying = true; // Auto-play when selected
    },

    // B. Toggle Play/Pause
    togglePlay: (state, action) => {
      // If a boolean is passed (true/false), force that state. Otherwise, flip it.
      if (action.payload !== undefined) {
        state.isPlaying = action.payload;
      } else {
        state.isPlaying = !state.isPlaying;
      }
    },

    // C. Next Track Logic
    playNext: (state) => {
      if (state.tracks.length > 0) {
        if (state.currentIndex < state.tracks.length - 1) {
          state.currentIndex += 1;
        } else {
          state.currentIndex = 0; // Loop back
        }
        state.currentTrack = state.tracks[state.currentIndex];
        state.isPlaying = true;
      }
    },

    // D. Previous Track Logic
    playPrev: (state) => {
      if (state.tracks.length > 0) {
        if (state.currentIndex > 0) {
          state.currentIndex -= 1;
        } else {
          state.currentIndex = state.tracks.length - 1; // Go to last song
        }
        state.currentTrack = state.tracks[state.currentIndex];
        state.isPlaying = true;
      }
    }
  },
  
  // Handling Async Thunks (Loading states)
  extraReducers: (builder) => {
    builder
      // Fetch Tracks
      .addCase(getTracks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTracks.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure payload is an array before assigning
        state.tracks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Song
      .addCase(uploadNewSong.fulfilled, (state, action) => {
        // Add the new song to the top of the list immediately
        if (action.payload) {
          state.tracks.unshift(action.payload);
        }
      });
  }
});

export const { setCurrentTrack, togglePlay, playNext, playPrev } = audioSlice.actions;
export default audioSlice.reducer;