import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import verificationReducer from './verificationSlice';
import adminReducer from './adminSlice';
import notificationReducer from './notificationSlice';
import orderReducer from './orderSlice';
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verification: verificationReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    orders: orderReducer,
    [api.reducerPath]: api.reducer, // Add the api reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware), // Add the api middleware
});
