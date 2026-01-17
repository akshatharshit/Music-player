import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// --- TRACKS API CALLS ---
// ==========================================

export const fetchTracks = async () => {
  const response = await api.get('/tracks');
  return response.data;
};

// 1. FIXED: Changed to PUT and added /play to match your backend trackRoutes.js
export const incrementPlayCount = async (id) => {
  const response = await api.put(`/tracks/${id}/play`); 
  return response.data;
};

// 2. FIXED: Changed endpoint to /tracks/add to match your backend
export const uploadTrack = async (formData) => {
  const response = await api.post('/tracks/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ==========================================
// --- LIBRARY API CALLS ---
// ==========================================

export const fetchLibraries = async () => {
  const response = await api.get('/libraries');
  return response.data;
};

export const fetchLibraryDetails = async (id) => {
  const response = await api.get(`/libraries/${id}`);
  return response.data;
};

// 3. FIXED: Prepared for potential cover image uploads for libraries
export const createLibrary = async (data) => {
  // If data is FormData (has a file), use multipart headers, otherwise normal JSON
  const isFormData = data instanceof FormData;
  const response = await api.post('/libraries', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const addSongToLibrary = async (libraryId, songId) => {
  const response = await api.post('/libraries/add-song', { libraryId, songId });
  return response.data;
};