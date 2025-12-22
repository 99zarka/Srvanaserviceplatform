import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import verificationReducer from './verificationSlice';
import adminReducer from './adminSlice';
import notificationReducer from './notificationSlice';
import orderReducer from './orderSlice';
import disputeReducer from './disputeSlice'; // Import new dispute reducer
import transactionReducer from './transactionSlice'; // Import new transaction reducer
import paymentReducer from './paymentSlice'; // Import new payment reducer
import servicesReducer from './servicesSlice'; // Import services reducer
import { api, aiChatApi } from '../services/api'; // Import aiChatApi

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
    services: servicesReducer, // Add the services reducer
    [api.reducerPath]: api.reducer,
    [aiChatApi.reducerPath]: aiChatApi.reducer, // Add aiChatApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, aiChatApi.middleware), // Add aiChatApi middleware
});
