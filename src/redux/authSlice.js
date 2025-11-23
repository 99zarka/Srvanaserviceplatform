import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BASE_URL from '../config/api';

// API base URL from config
const API_BASE_URL = BASE_URL;

// Initial state
const initialState = {
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'Failed to fetch user profile.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error fetching user profile.');
    }
  }
);

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found.');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      let bodyContent;
      let contentType;

      // Check if userData contains a File object (for profile_photo)
      if (userData.profile_photo instanceof File) {
        const formData = new FormData();
        for (const key in userData) {
          if (userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        }
        bodyContent = formData;
        // fetch will automatically set Content-Type to multipart/form-data with boundary
        contentType = undefined; 
      } else {
        bodyContent = JSON.stringify(userData);
        contentType = 'application/json';
      }

      if (contentType) {
        headers['Content-Type'] = contentType;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'PATCH',
        headers: headers,
        body: bodyContent,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data || 'Failed to update user profile.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error updating user profile.');
    }
  }
);

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    console.log('Login thunk called with:', { email, password });

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login API response status:', response.status);

      const data = await response.json();
      console.log('Login API response data:', data);

      if (!response.ok) {
        console.log('Login failed with error:', data.detail || 'Login failed');
        return rejectWithValue(data.detail || 'Login failed');
      }

      console.log('Login successful with data:', data);

      // After successful login, fetch user data
      // Try different endpoints that might be accessible to regular users
      const userEndpointsToTry = [
        // Try user's own profile by user_id (assuming user IDs are 1, 2, 3, etc. - this won't work)
        // Since we don't know the user ID, let's try a fallback approach
        // Try accessing user data through addresses endpoint (if it includes user info)
      ];

      // For now, let's assume the regular user cannot access /users/users/ list
      // We'll store basic user info and can try to fetch more data later if needed
      console.log('Login successful. Token received but user data fetch may be restricted by API permissions.');

      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Async thunk for registration
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    console.log('Registration thunk called with:', userData);

    try {
      const response = await fetch(`${API_BASE_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration API response data:', data);

      if (!response.ok) {
        console.log('Registration failed with error:', data);
        return rejectWithValue(data);
      }

      console.log('Registration successful with data:', data);

      return data;
    } catch (error) {
      console.log('Registration network error:', error);
      return rejectWithValue('Network error');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.error = null;

        // Store in localStorage
        localStorage.setItem('token', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
        // Dispatch fetchUserProfile after successful login to get full user data
        // The user object will be updated in fetchUserProfile.fulfilled
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.error = null;

        // Auto-login after registration - store in localStorage
        localStorage.setItem('token', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
        // Dispatch fetchUserProfile after successful registration to get full user data
        // The user object will be updated in fetchUserProfile.fulfilled

        console.log('Registration successful. User auto-logged in.');
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload }; // Merge fetched data
        localStorage.setItem('user', JSON.stringify(state.user));
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload }; // Merge updated data
        localStorage.setItem('user', JSON.stringify(state.user));
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
