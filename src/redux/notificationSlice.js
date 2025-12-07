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
  async (pageUrl = API_URL, thunkAPI) => { // Accept pageUrl as an argument, default to API_URL
    try {
      const headers = getAuthHeader(thunkAPI);
      const response = await fetch(pageUrl, { headers }); // Use pageUrl for fetching
      
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
    allNotifications: [], // To store all fetched notifications across pages
    notifications: [], // This might become redundant or used for a subset if needed, but for now, allNotifications is the primary
    loading: false,
    error: null,
    unreadCount: 0,
    nextPageUrl: null, // Stores the URL for the next page of notifications
    hasMore: false, // Indicates if there are more pages to load
    currentPage: 1, // Tracks the current page number
    loadingMore: false, // Loading state specifically for "Load More" action
    // For transient UI notifications (e.g., success/error toasts)
    uiNotifications: [], 
  },
  reducers: {
    clearNotifications: (state) => {
        state.allNotifications = []; // Clear all notifications
        state.notifications = []; // Also clear old notifications
        state.unreadCount = 0;
        state.error = null;
        state.nextPageUrl = null;
        state.hasMore = false;
        state.currentPage = 1;
        state.loadingMore = false;
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
    // Action to reset loadingMore state
    setLoadingMore: (state, action) => {
        state.loadingMore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state, action) => {
        // Check if this is the initial fetch or a "load more" fetch
        const isInitialFetch = action.meta.arg === API_URL || action.meta.arg === undefined;
        if (isInitialFetch) {
            state.loading = true;
            state.error = null;
        } else {
            state.loadingMore = true; // Set loadingMore for subsequent fetches
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false; // Reset loadingMore
        
        const notificationsData = action.payload.results || [];
        const isInitialFetch = action.meta.arg === API_URL || action.meta.arg === undefined;

        if (isInitialFetch) {
            state.allNotifications = notificationsData;
            state.currentPage = 1;
        } else {
            state.allNotifications = [...state.allNotifications, ...notificationsData];
            state.currentPage += 1; // Increment page for subsequent fetches
        }
        
        state.nextPageUrl = action.payload.next;
        state.hasMore = !!action.payload.next; // Convert to boolean
        state.unreadCount = state.allNotifications.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false; // Reset loadingMore
        state.error = action.payload;
      })
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        // Update in allNotifications
        const index = state.allNotifications.findIndex(n => n.id === updatedNotification.id);
        if (index !== -1) {
            if (!state.allNotifications[index].is_read && updatedNotification.is_read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.allNotifications[index] = updatedNotification;
        }
        // Also update in the old notifications array for backward compatibility if it's still used
        const oldIndex = state.notifications.findIndex(n => n.id === updatedNotification.id);
        if (oldIndex !== -1) {
            state.notifications[oldIndex] = updatedNotification;
        }
      });
  },
});

export const { clearNotifications, addNotification, removeNotification, setLoadingMore } = notificationSlice.actions;
export default notificationSlice.reducer;
