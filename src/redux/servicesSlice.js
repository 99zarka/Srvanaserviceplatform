import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Fetch services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const pageSize = params.page_size || 50;
      const response = await api.get(`/services/services/?page_size=${pageSize}`);
      return response; // Return the entire response object
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearServicesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload?.results || [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearServicesError } = servicesSlice.actions;
export default servicesSlice.reducer;
