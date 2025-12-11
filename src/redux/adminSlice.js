import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BASE_URL from '../config/api';

// Initial state
const initialState = {
  pendingVerifications: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalVerifications: 0,
};

// Async thunk to fetch pending verification documents
export const getPendingVerifications = createAsyncThunk(
  'admin/getPendingVerifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'فشل في جلب طلبات التحقق.');
      }

      const rawDocs = data.results || data;
      
      // Process individual documents instead of grouping by user
      const processedDocs = [];
      
      if (Array.isArray(rawDocs)) {
        for (const doc of rawDocs) {
          // technician_user is just an ID, we need to fetch user details
          const userId = doc.technician_user;
          
          // Fetch user details for this technician
          const userResponse = await fetch(`${BASE_URL}/users/${userId}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          let userDetail = {
            id: userId,
            first_name: "",
            last_name: "",
            email: "",
            address: "",
            bio: "",
            specialization: "",
            skills_text: "",
            experience_years: null,
            hourly_rate: null
          };
          
          if (userResponse.ok) {
            userDetail = await userResponse.json();
          }
          
          const processedDoc = {
            id: doc.doc_id, // Use the actual document ID
            doc_id: doc.doc_id, // Keep the original doc_id
            document_type: doc.document_type,
            document_url: doc.document_url,
            upload_date: doc.upload_date,
            verification_status: doc.verification_status?.toLowerCase(),
            rejection_reason: doc.rejection_reason,
            technician_user_id: userId, // This is just the user ID
            
            // User details from the user API call
            user: userDetail,
            address: userDetail.address,
            description: userDetail.bio,
            specialization: userDetail.specialization,
            skills: userDetail.skills_text,
            experience_years: userDetail.experience_years,
            hourly_rate: userDetail.hourly_rate
          };
          
          processedDocs.push(processedDoc);
        }
      }

      return processedDocs;
    } catch (error) {
      console.error('Verification fetch error:', error);
      return rejectWithValue('خطأ في الشبكة أثناء جلب طلبات التحقق.');
    }
  }
);

// Async thunk to approve a verification document
export const approveVerification = createAsyncThunk(
  'admin/approveVerification',
  async (verificationId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/${verificationId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'فشل في قبول طلب التحقق.');
      }

      return { id: verificationId, ...data };
    } catch (error) {
      return rejectWithValue('خطأ في الشبكة أثناء قبول طلب التحقق.');
    }
  }
);

// Async thunk to reject a verification document
export const rejectVerification = createAsyncThunk(
  'admin/rejectVerification',
  async ({ verificationId, reason }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/${verificationId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'فشل في رفض طلب التحقق.');
      }

      return { id: verificationId, ...data };
    } catch (error) {
      return rejectWithValue('خطأ في الشبكة أثناء رفض طلب التحقق.');
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateVerificationStatus: (state, action) => {
      const { id, verification_status } = action.payload;
      const verification = state.pendingVerifications.find(v => v.id === id);
      if (verification) {
        verification.verification_status = verification_status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get pending verifications cases
      .addCase(getPendingVerifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingVerifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVerifications = action.payload;
        state.error = null;
      })
      .addCase(getPendingVerifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve verification cases
      .addCase(approveVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the status of the approved verification
        const { id } = action.payload;
        const verification = state.pendingVerifications.find(v => v.id === id);
        if (verification) {
          verification.verification_status = 'approved';
        }
        state.error = null;
      })
      .addCase(approveVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reject verification cases
      .addCase(rejectVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the status of the rejected verification
        const { id } = action.payload;
        const verification = state.pendingVerifications.find(v => v.id === id);
        if (verification) {
          verification.verification_status = 'rejected';
        }
        state.error = null;
      })
      .addCase(rejectVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateVerificationStatus } = adminSlice.actions;
export default adminSlice.reducer;
