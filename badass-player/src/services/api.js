import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// TRACKS API
// ==========================================

// Fetch all tracks
export const fetchTracks = async () => {
  const response = await api.get('/tracks');
  return response.data;
};

// Increment play count
export const incrementPlayCount = async (id) => {
  const response = await api.put(`/tracks/${id}/play`);
  return response.data;
};

// Upload a new track (audio + cover)
export const uploadTrack = async (formData) => {
  const response = await api.post('/tracks/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ==========================================
// LIBRARY API
// ==========================================

// Fetch all libraries/playlists
export const fetchLibraries = async () => {
  const response = await api.get('/libraries');
  return response.data;
};

// Fetch one library
export const fetchLibraryDetails = async (id) => {
  const response = await api.get(`/libraries/${id}`);
  return response.data;
};

// Create library (supports JSON and FormData)
export const createLibrary = async (payload) => {
  const isFormData = payload instanceof FormData;

  const response = await api.post('/libraries', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });

  return response.data;
};

// Add song to library
export const addSongToLibrary = async (libraryId, songId) => {
  const response = await api.post('/libraries/add-song', { libraryId, songId });
  return response.data;
};
