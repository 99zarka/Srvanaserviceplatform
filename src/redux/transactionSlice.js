import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all transactions for the current user
export const getUserTransactions = createAsyncThunk(
  'transactions/getUserTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions/me/');
      return response; // Corrected: return the parsed data directly
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get details of a specific transaction
export const getTransactionDetail = createAsyncThunk(
  'transactions/getTransactionDetail',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions/${transactionId}/`);
      return response; // Corrected: return the parsed data directly
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    currentTransaction: null,
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
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Transactions
      .addCase(getUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure action.payload is an object, then safely access results
        const payload = action.payload || {}; 
        state.transactions = (payload.results) ? payload.results : [];
        console.log("transactionSlice: getUserTransactions.fulfilled - action.payload:", action.payload);
        console.log("transactionSlice: getUserTransactions.fulfilled - state.transactions (after update):", state.transactions);
        state.error = null;
      })
      .addCase(getUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Transaction Detail
      .addCase(getTransactionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.error = null;
      })
      .addCase(getTransactionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  clearCurrentTransaction 
} = transactionSlice.actions;
export default transactionSlice.reducer;
