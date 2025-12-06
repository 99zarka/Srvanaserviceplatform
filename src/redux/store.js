import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import verificationReducer from './verificationSlice';
import adminReducer from './adminSlice';
import notificationReducer from './notificationSlice';
import orderReducer from './orderSlice';
import disputeReducer from './disputeSlice'; // Import new dispute reducer
import transactionReducer from './transactionSlice'; // Import new transaction reducer
import paymentReducer from './paymentSlice'; // Import new payment reducer
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verification: verificationReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    orders: orderReducer,
    disputes: disputeReducer,
    transactions: transactionReducer,
    payments: paymentReducer, // Add the payment reducer
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
