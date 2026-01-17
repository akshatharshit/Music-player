import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchLibraries, 
  fetchLibraryDetails, 
  createLibrary, 
  addSongToLibrary 
} from '../services/api';

// --- ASYNC THUNKS ---

// 1. Fetch All Libraries
export const getLibraries = createAsyncThunk(
  'library/getAll',
  async (_, { rejectWithValue }) => {
    try {
      // FIXED: fetchLibraries() now returns the array directly
      const data = await fetchLibraries();
      return data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch libraries");
    }
  }
);

// 2. Fetch One Library
export const getLibraryById = createAsyncThunk(
  'library/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchLibraryDetails(id);
      return data; 
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
      const data = await createLibrary(libraryData);
      return data; 
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
      const data = await addSongToLibrary(libraryId, songId);
      return data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || "Could not add song");
    }
  }
);

// --- SLICE STATE remains same ---
const initialState = {
  list: [],
  activeLibrary: null,
  loading: false,
  error: null
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    resetActiveLibrary: (state) => {
      state.activeLibrary = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(getLibraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLibraries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : []; // Safety check
      })
      .addCase(getLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch One
      .addCase(getLibraryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLibraryById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeLibrary = action.payload;
      })
      .addCase(getLibraryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create New
      .addCase(createNewLibrary.fulfilled, (state, action) => {
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      // Add Song
      .addCase(addSong.fulfilled, (state, action) => {
        if (state.activeLibrary && action.payload && state.activeLibrary._id === action.payload._id) {
          state.activeLibrary = action.payload;
        }
      });
  }
});

export const { resetActiveLibrary } = librarySlice.actions;
export default librarySlice.reducer;