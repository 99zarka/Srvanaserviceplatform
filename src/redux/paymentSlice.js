import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api'; // Assuming you have an axios instance configured

export const getUserBalances = createAsyncThunk(
  'payments/getUserBalances',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me/'); // Assuming a /users/me/ endpoint returns user profile with balances
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const transferPendingToAvailable = createAsyncThunk(
  'payments/transferPendingToAvailable',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/payments/transfer-pending-to-available/');
      dispatch(getUserBalances()); // Refresh balances after successful transfer
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    userBalances: {
      available_balance: 0,
      in_escrow_balance: 0,
      pending_balance: 0,
    },
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBalances.fulfilled, (state, action) => {
        state.loading = false;
        // Update only the balance fields, assuming the API returns a full user object
        state.userBalances.available_balance = action.payload.available_balance;
        state.userBalances.in_escrow_balance = action.payload.in_escrow_balance;
        state.userBalances.pending_balance = action.payload.pending_balance;
      })
      .addCase(getUserBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(transferPendingToAvailable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(transferPendingToAvailable.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Funds transferred successfully!';
        // Balances will be updated by getUserBalances dispatch
      })
      .addCase(transferPendingToAvailable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearPaymentSuccessMessage } = paymentSlice.actions;
export default paymentSlice.reducer;
