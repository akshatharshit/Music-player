import axios from 'axios';

// Access env variable in Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// --- TRACKS API CALLS (Fixed Redux Error) ---
// ==========================================

// 1. Get all songs/tracks
export const fetchTracks = async () => {
  const response = await api.get('/tracks');
  return response.data; // Returns the actual array of songs
};

// 2. Increment play count for a song
export const incrementPlayCount = async (id) => {
  const response = await api.post(`/tracks/${id}/play`);
  return response.data;
};

// ==========================================
// --- LIBRARY API CALLS ---
// ==========================================

// 3. Get list of all playlists (e.g., "My Chill Mix", "Workout")
export const fetchLibraries = () => api.get('/libraries');

// 4. Get one playlist with full song details
export const fetchLibraryDetails = (id) => api.get(`/libraries/${id}`);

// 5. Create a new playlist
export const createLibrary = (data) => api.post('/libraries', data);

// 6. Add a song to a playlist
export const addSongToLibrary = (libraryId, songId) => 
  api.post('/libraries/add-song', { libraryId, songId });

export const uploadTrack = async (formData) => {
  // We use 'headers' to tell the server we are sending a file (multipart)
  const response = await api.post('/tracks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};