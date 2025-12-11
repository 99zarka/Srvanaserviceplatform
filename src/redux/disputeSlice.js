import { createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Dispute slice using RTK Query endpoints
const disputeSlice = createSlice({
  name: 'disputes',
  initialState: {
    disputes: [], // For all disputes related to the current user or an order
    currentDispute: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentDispute: (state) => {
      state.currentDispute = null;
    },
    setDisputes: (state, action) => {
      state.disputes = action.payload;
    },
    setCurrentDispute: (state, action) => {
      state.currentDispute = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle dispute-related actions from RTK Query
      .addMatcher(
        api.endpoints.getDisputes.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.getDisputes.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.disputes = action.payload.results || action.payload;
        }
      )
      .addMatcher(
        api.endpoints.getDisputes.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to fetch disputes';
        }
      )

      .addMatcher(
        api.endpoints.getDisputeDetail.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.getDisputeDetail.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.currentDispute = action.payload;
        }
      )
      .addMatcher(
        api.endpoints.getDisputeDetail.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to fetch dispute details';
        }
      )

      .addMatcher(
        api.endpoints.createDispute.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        api.endpoints.createDispute.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.successMessage = 'Dispute created successfully!';
          // Add new dispute to the list
          state.disputes = [...state.disputes, action.payload];
        }
      )
      .addMatcher(
        api.endpoints.createDispute.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to create dispute';
        }
      )

      .addMatcher(
        api.endpoints.updateDispute.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        api.endpoints.updateDispute.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.successMessage = 'Dispute updated successfully!';
          // Update dispute in the list
          state.disputes = state.disputes.map(d =>
            d.id === action.payload.id ? action.payload : d
          );
          if (state.currentDispute?.id === action.payload.id) {
            state.currentDispute = action.payload;
          }
        }
      )
      .addMatcher(
        api.endpoints.updateDispute.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to update dispute';
        }
      )

      .addMatcher(
        api.endpoints.resolveDispute.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        api.endpoints.resolveDispute.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.successMessage = 'Dispute resolved successfully!';
          // Update dispute in the list
          state.disputes = state.disputes.map(d =>
            d.id === action.payload.id ? action.payload : d
          );
          if (state.currentDispute?.id === action.payload.id) {
            state.currentDispute = action.payload;
          }
        }
      )
      .addMatcher(
        api.endpoints.resolveDispute.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to resolve dispute';
        }
      );
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearCurrentDispute,
  setDisputes,
  setCurrentDispute
} = disputeSlice.actions;

export default disputeSlice.reducer;

// Export RTK Query hooks for direct use in components
export const {
  useGetDisputesQuery,
  useGetDisputeDetailQuery,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
  useResolveDisputeMutation,
} = api;
