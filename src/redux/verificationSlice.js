import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BASE_URL from '../config/api';

// Initial state
const initialState = {
  verificationStatus: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
  isUploading: false,
};

// Async thunk to get verification status
export const getVerificationStatus = createAsyncThunk(
  'verification/getVerificationStatus',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/?user=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'فشل في جلب حالة التحقق.');
      }

      // Return the first verification document if exists
      return data.results?.[0] || data[0] || null;
    } catch (error) {
      return rejectWithValue('خطأ في الشبكة أثناء جلب حالة التحقق.');
    }
  }
);

// Async thunk to upload verification documents
export const uploadVerificationDocuments = createAsyncThunk(
  'verification/uploadVerificationDocuments',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'فشل في رفع المستندات.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('خطأ في الشبكة أثناء رفع المستندات.');
    }
  }
);

// Verification slice
const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    clearVerificationStatus: (state) => {
      state.verificationStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get verification status cases
      .addCase(getVerificationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVerificationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationStatus = action.payload;
        state.error = null;
      })
      .addCase(getVerificationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload verification documents cases
      .addCase(uploadVerificationDocuments.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadVerificationDocuments.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.verificationStatus = action.payload;
        state.error = null;
      })
      .addCase(uploadVerificationDocuments.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setUploadProgress, 
  setUploading, 
  clearVerificationStatus 
} = verificationSlice.actions;

export default verificationSlice.reducer;
