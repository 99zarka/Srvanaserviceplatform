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
      
      // Group documents by user and aggregate data to match frontend expectation
      const userDocsMap = {};
      
      if (Array.isArray(rawDocs)) {
        rawDocs.forEach(doc => {
          // technician_user is now a nested object with user details
          const user = doc.technician_user;
          const uid = user.user_id || user.id; // Handle potential ID field name difference
          
          if (!userDocsMap[uid]) {
            userDocsMap[uid] = {
              id: doc.doc_id, // Use one doc ID as reference key
              technician_user_id: uid,
              documents: [],
              verification_status: doc.verification_status?.toLowerCase(),
              submitted_at: doc.upload_date,
              rejection_reason: doc.rejection_reason,
              
              // User details directly from nested object
              user: user,
              address: user.address,
              description: user.bio,
              specialization: user.specialization,
              skills: user.skills_text,
              experience_years: user.experience_years,
              hourly_rate: user.hourly_rate
            };
          }
          
          // Map document types to specific fields
          if (doc.document_type === 'ID Card') {
            userDocsMap[uid].id_document = doc.document_url;
          } else if (doc.document_type === 'Certificate') {
            userDocsMap[uid].certificate_document = doc.document_url;
          } else if (doc.document_type === 'Portfolio') {
            userDocsMap[uid].portfolio_document = doc.document_url;
          }
          
          userDocsMap[uid].documents.push(doc);
          
          // Prioritize 'pending' status if any document is pending
          if (doc.verification_status === 'Pending' || doc.verification_status === 'pending') {
            userDocsMap[uid].verification_status = 'pending';
          }
        });
      }

      return Object.values(userDocsMap);
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
