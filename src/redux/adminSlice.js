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
  pageSize: 10,
  filters: {
    status: 'all',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    documentType: ''
  }
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
      
      // Process documents using the prefetched user data
      const processedDocs = [];
      
      if (Array.isArray(rawDocs)) {
        for (const doc of rawDocs) {
          // Use the prefetched technician_user data instead of making individual API calls
          const userDetail = doc.technician_user || {
            id: doc.technician_user_id || null,
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
          
          const processedDoc = {
            id: doc.doc_id, // Use the actual document ID
            doc_id: doc.doc_id, // Keep the original doc_id
            document_type: doc.document_type,
            document_url: doc.document_url,
            upload_date: doc.upload_date,
            verification_status: doc.verification_status?.toLowerCase(),
            rejection_reason: doc.rejection_reason,
            technician_user_id: userDetail.id, // Use the user ID from prefetched data
            
            // User details from the prefetched data (no individual API calls needed!)
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

// Async thunk to fetch verification documents with pagination and filtering
export const fetchVerificationsPaginated = createAsyncThunk(
  'admin/fetchVerificationsPaginated',
  async ({ page = 1, pageSize = 10, filters = {} }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('لا يوجد رمز مصادقة. يجب تسجيل الدخول أولاً.');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      // Add filters to query parameters
      if (filters.status && filters.status !== 'all') {
        queryParams.append('verification_status', filters.status);
      }
      if (filters.searchTerm) {
        queryParams.append('technician_name', filters.searchTerm);
      }
      if (filters.dateFrom) {
        queryParams.append('upload_date_gte', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append('upload_date_lte', filters.dateTo);
      }
      if (filters.documentType) {
        queryParams.append('document_type', filters.documentType);
      }

      const response = await fetch(`${BASE_URL}/technicians/verificationdocuments/?${queryParams.toString()}`, {
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

      const rawDocs = data.results || [];
      
      // Process documents using the prefetched user data
      const processedDocs = [];
      
      if (Array.isArray(rawDocs)) {
        for (const doc of rawDocs) {
          // Use the prefetched technician_user data instead of making individual API calls
          const userDetail = doc.technician_user || {
            id: doc.technician_user_id || null,
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
          
          const processedDoc = {
            id: doc.doc_id, // Use the actual document ID
            doc_id: doc.doc_id, // Keep the original doc_id
            document_type: doc.document_type,
            document_url: doc.document_url,
            upload_date: doc.upload_date,
            verification_status: doc.verification_status?.toLowerCase(),
            rejection_reason: doc.rejection_reason,
            technician_user_id: userDetail.id, // Use the user ID from prefetched data
            
            // User details from the prefetched data (no individual API calls needed!)
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

      return {
        results: processedDocs,
        count: data.count || 0,
        next: data.next,
        previous: data.previous
      };
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
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        searchTerm: '',
        dateFrom: '',
        dateTo: '',
        documentType: ''
      };
    }
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
      // Fetch verifications paginated cases
      .addCase(fetchVerificationsPaginated.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVerificationsPaginated.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVerifications = action.payload.results || [];
        state.totalVerifications = action.payload.count || 0;
        state.currentPage = action.meta.arg.page || 1;
        const count = action.payload.count || 0;
        const pageSize = action.meta.arg.pageSize || state.pageSize;
        state.totalPages = Math.ceil(count / pageSize) || 1;
        state.error = null;
      })
      .addCase(fetchVerificationsPaginated.rejected, (state, action) => {
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

export const { clearError, updateVerificationStatus, updateFilters, resetFilters } = adminSlice.actions;
export default adminSlice.reducer;
