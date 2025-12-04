import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
      const headers = getAuthHeader(thunkAPI);
      const response = await fetch(API_URL, { headers });
      
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message || 'Failed to fetch notifications');
      }
      
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, thunkAPI) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(thunkAPI),
      };
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message || 'Failed to mark notification as read');
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to mark notification as read');
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
    // For transient UI notifications (e.g., success/error toasts)
    uiNotifications: [], 
  },
  reducers: {
    clearNotifications: (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.error = null;
    },
    // Action to add a new UI notification (e.g., from global error handler)
    addNotification: (state, action) => {
      // payload should be { id: uuid, message: string, type: 'success' | 'error' | 'info' }
      state.uiNotifications.push(action.payload);
    },
    // Action to remove a UI notification after it has been displayed/dismissed
    removeNotification: (state, action) => {
      state.uiNotifications = state.uiNotifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
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

export const { clearNotifications, addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
