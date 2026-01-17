import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTracks, incrementPlayCount, uploadTrack } from "../services/api";

// =============================
// THUNKS
// =============================

// Fetch all tracks
export const getTracks = createAsyncThunk(
  'audio/getTracks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTracks();
      return data; 
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed to fetch tracks");
    }
  }
);

// Increment play count
export const recordPlay = createAsyncThunk(
  'audio/recordPlay',
  async (id, { rejectWithValue }) => {
    try {
      const data = await incrementPlayCount(id);
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Failed to record play");
    }
  }
);

// Upload new track (audio + cover)
export const uploadNewSong = createAsyncThunk(
  "audio/uploadNewSong",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await uploadTrack(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || "Upload failed");
    }
  }
);

// =============================
// INITIAL STATE
// =============================
const initialState = {
  tracks: [],
  loading: false,
  error: null,

  currentTrack: null,
  currentIndex: -1,
  isPlaying: false,
};

// =============================
// SLICE
// =============================
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
      state.currentIndex = state.tracks.findIndex(t => t._id === action.payload._id);
      state.isPlaying = true;
    },

    togglePlay: (state, action) => {
      state.isPlaying = action.payload !== undefined 
        ? action.payload 
        : !state.isPlaying;
    },

    playNext: (state) => {
      if (state.tracks.length === 0) return;

      state.currentIndex = 
        state.currentIndex < state.tracks.length - 1
          ? state.currentIndex + 1
          : 0;

      state.currentTrack = state.tracks[state.currentIndex];
      state.isPlaying = true;
    },

    playPrev: (state) => {
      if (state.tracks.length === 0) return;

      state.currentIndex = 
        state.currentIndex > 0
          ? state.currentIndex - 1
          : state.tracks.length - 1;

      state.currentTrack = state.tracks[state.currentIndex];
      state.isPlaying = true;
    }
  },

  extraReducers: (builder) => {
    builder
      // Get all tracks
      .addCase(getTracks.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(getTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload new track
      .addCase(uploadNewSong.fulfilled, (state, action) => {
        if (action.payload) {
          state.tracks.unshift(action.payload);
        }
      })
      .addCase(uploadNewSong.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Record play
      .addCase(recordPlay.fulfilled, (state, action) => {
        const updatedTrack = action.payload;
        const i = state.tracks.findIndex(t => t._id === updatedTrack._id);
        if (i !== -1) {
          state.tracks[i] = updatedTrack;
        }

        // If currently playing, also update currentTrack
        if (state.currentTrack && state.currentTrack._id === updatedTrack._id) {
          state.currentTrack = updatedTrack;
        }
      });
  }
});

export const { setCurrentTrack, togglePlay, playNext, playPrev } = audioSlice.actions;
export default audioSlice.reducer;
