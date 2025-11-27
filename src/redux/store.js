import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import verificationReducer from './verificationSlice';
import adminReducer from './adminSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verification: verificationReducer,
    admin: adminReducer,
    notifications: notificationReducer,
  },
});
