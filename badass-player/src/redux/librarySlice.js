import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchLibraries, 
  fetchLibraryDetails, 
  createLibrary, 
  addSongToLibrary 
} from '../services/api';

// --- ASYNC THUNKS ---

// 1. Fetch All Libraries (Sidebar)
export const getLibraries = createAsyncThunk(
  'library/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchLibraries();
      // Assumes backend returns an array of libraries directly in data
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch libraries");
    }
  }
);

// 2. Fetch One Library (Playlist View)
export const getLibraryById = createAsyncThunk(
  'library/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchLibraryDetails(id);
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load playlist");
    }
  }
);

// 3. Create New Library
export const createNewLibrary = createAsyncThunk(
  'library/create',
  async (libraryData, { rejectWithValue }) => {
    try {
      const response = await createLibrary(libraryData);
      return response.data; // Should return the newly created object
    } catch (err) {
      return rejectWithValue(err.response?.data || "Creation failed");
    }
  }
);

// 4. Add Song to Library
export const addSong = createAsyncThunk(
  'library/addSong',
  async ({ libraryId, songId }, { rejectWithValue }) => {
    try {
      const response = await addSongToLibrary(libraryId, songId);
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Could not add song");
    }
  }
);

// --- SLICE STATE ---
const initialState = {
  list: [],           // Sidebar list
  activeLibrary: null, // Current playlist view
  loading: false,     // Spinner state
  error: null         // Error messages
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    // Clear the active view when navigating away
    resetActiveLibrary: (state) => {
      state.activeLibrary = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch All ---
      .addCase(getLibraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLibraries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch One ---
      .addCase(getLibraryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLibraryById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeLibrary = action.payload;
      })
      .addCase(getLibraryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create New ---
      .addCase(createNewLibrary.fulfilled, (state, action) => {
        // Add new playlist to the top of the sidebar immediately
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })

      // --- Add Song ---
      .addCase(addSong.fulfilled, (state, action) => {
        // If the backend returns the updated library object, we update the view.
        // This ensures the song appears in the list immediately without a refresh.
        if (state.activeLibrary && action.payload && state.activeLibrary._id === action.payload._id) {
          state.activeLibrary = action.payload;
        }
      });
  }
});

export const { resetActiveLibrary } = librarySlice.actions;
export default librarySlice.reducer;