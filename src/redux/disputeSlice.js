import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Initiate a dispute for an order
export const initiateDispute = createAsyncThunk(
  'disputes/initiateDispute',
  async ({ orderId, clientArgument }, { rejectWithValue }) => {
    try {
      // disputeData should contain { orderId, clientArgument }
      const response = await api.post(`/orders/${orderId}/initiate-dispute/`, { client_argument: clientArgument });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get disputes for a specific order
export const getOrderDisputes = createAsyncThunk(
  'disputes/getOrderDisputes',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/disputes/orders/${orderId}/disputes/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get details of a specific dispute
export const getDisputeDetail = createAsyncThunk(
  'disputes/getDisputeDetail',
  async (disputeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/disputes/disputes/${disputeId}/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Respond to a dispute (for both client and technician)
export const respondToDispute = createAsyncThunk(
  'disputes/respondToDispute',
  async ({ disputeId, responseData }, { rejectWithValue }) => {
    try {
      // responseData should contain { message }
      const response = await api.patch(`/disputes/disputes/${disputeId}/respond/`, responseData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Resolve a dispute (typically by an admin or arbitrator)
export const resolveDispute = createAsyncThunk(
  'disputes/resolveDispute',
  async ({ disputeId, resolutionData }, { rejectWithValue }) => {
    try {
      // resolutionData should contain { decision, resolved_by, amount_to_client, amount_to_technician }
      const response = await api.post(`/disputes/disputes/${disputeId}/resolve/`, resolutionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      // Initiate Dispute
      .addCase(initiateDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(initiateDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Dispute initiated successfully!';
        // Assuming the backend returns the updated order or the new dispute object
        // The `order` object contains the `dispute_id` if successfully created
        const updatedOrder = action.payload.order;
        if (updatedOrder && updatedOrder.dispute_id) {
          // If we have a list of client orders or disputes, we'd update them here.
          // For now, let's just assume success and the user might refetch disputes.
          state.currentDispute = { dispute_id: updatedOrder.dispute_id, order: updatedOrder };
        }
      })
      .addCase(initiateDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // Get Order Disputes
      .addCase(getOrderDisputes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDisputes.fulfilled, (state, action) => {
        state.loading = false;
        state.disputes = action.payload.results || action.payload; // Adjust based on pagination
        state.error = null;
      })
      .addCase(getOrderDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Dispute Detail
      .addCase(getDisputeDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDisputeDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDispute = action.payload;
        state.error = null;
      })
      .addCase(getDisputeDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Respond to Dispute
      .addCase(respondToDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(respondToDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Dispute response sent successfully!';
        if (state.currentDispute && state.currentDispute.id === action.payload.id) {
          state.currentDispute = action.payload; // Update current dispute with latest status/response
        }
        state.disputes = state.disputes.map(d => 
          d.id === action.payload.id ? action.payload : d
        );
      })
      .addCase(respondToDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // Resolve Dispute
      .addCase(resolveDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Dispute resolved successfully!';
        if (state.currentDispute && state.currentDispute.id === action.payload.id) {
          state.currentDispute = action.payload;
        }
        state.disputes = state.disputes.map(d => 
          d.id === action.payload.id ? action.payload : d
        );
      })
      .addCase(resolveDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  clearCurrentDispute 
} = disputeSlice.actions;
export default disputeSlice.reducer;
