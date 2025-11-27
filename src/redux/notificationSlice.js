import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/notifications/notifications/';

// Helper to get auth header
const getAuthHeader = (thunkAPI) => {
  const state = thunkAPI.getState();
  const token = state.auth.token;
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, thunkAPI) => {
    try {
      const config = {
        headers: getAuthHeader(thunkAPI),
      };
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, thunkAPI) => {
    try {
      const config = {
        headers: getAuthHeader(thunkAPI),
      };
      const response = await axios.patch(`${API_URL}${id}/`, { is_read: true }, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    clearNotifications: (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Handle paginated response (results array) or non-paginated (direct array)
        const notificationsData = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
        
        state.notifications = notificationsData;
        state.unreadCount = notificationsData.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        const index = state.notifications.findIndex(n => n.id === updatedNotification.id);
        if (index !== -1) {
            // Check if it was unread before updating
            if (!state.notifications[index].is_read && updatedNotification.is_read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications[index] = updatedNotification;
        }
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
