import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BASE_URL from '../config/api';

// API base URL from config
const API_BASE_URL = BASE_URL;

// Initial state
const initialState = {
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  users: [], // New state to store all users
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  page_size: 10, // Define default page size for frontend pagination calculation
};

// Async thunk to fetch current user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (tokenOverride, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // Use provided token override (e.g. from login) or fallback to state token
      const token = typeof tokenOverride === 'string' ? tokenOverride : auth.token;
      
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

// Async thunk to fetch any public user profile
export const fetchPublicUserProfile = createAsyncThunk(
  'auth/fetchPublicUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/public/${userId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'Failed to fetch public user profile.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error fetching public user profile.');
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

// Async thunk to fetch all users with pagination
export const fetchPublicUsersPaginated = createAsyncThunk(
  'auth/fetchPublicUsersPaginated',
  async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/public/all/?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || 'Failed to fetch public users.');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error fetching public users.');
    }
  }
);

// Async thunk for login - Fixed version
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

      // If user data is missing in response (fallback), fetch it
      if (!data.user) {
        try {
          await dispatch(fetchUserProfile(data.access));
        } catch (profileError) {
          console.log('Failed to fetch user profile after login:', profileError);
        }
      }

      // Return login response
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

      // If user data is missing in response (fallback), fetch it
      if (!data.user) {
        try {
           // Use data.tokens.access for registration response structure
           const accessToken = data.tokens?.access;
           if (accessToken) {
             await dispatch(fetchUserProfile(accessToken));
           }
        } catch (profileError) {
          console.log('Failed to fetch user profile after registration:', profileError);
        }
      }

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
        
        // Store user if provided in response
        if (action.payload.user) {
          state.user = action.payload.user;
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }

        // Store in localStorage
        localStorage.setItem('token', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
        
        console.log('Login successful, tokens stored:', {
          token: action.payload.access ? 'present' : 'missing',
          refreshToken: action.payload.refresh ? 'present' : 'missing'
        });
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
        
        // Handle registration response structure (tokens object)
        const accessToken = action.payload.tokens?.access || action.payload.access;
        const refreshToken = action.payload.tokens?.refresh || action.payload.refresh;
        
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        state.error = null;

        // Store user if provided in response
        if (action.payload.user) {
          state.user = action.payload.user;
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }

        // Auto-login after registration - store in localStorage
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        console.log('Registration successful, tokens stored:', {
          token: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing'
        });
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
        // Update user data
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        console.log('User profile fetched and stored:', action.payload);
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.log('Failed to fetch user profile:', action.payload);
      })
      // Fetch public user profile cases
      .addCase(fetchPublicUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // For public profile, we don't update the 'user' in state, but may store it separately
        // For now, it will just return the data, and component will handle
        state.error = null;
      })
      .addCase(fetchPublicUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public users paginated cases
      .addCase(fetchPublicUsersPaginated.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicUsersPaginated.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.results || [];
        state.currentPage = action.meta.arg.page || 1;
        const count = action.payload.count || 0;
        const pageSize = action.meta.arg.pageSize || initialState.page_size;
        state.totalPages = Math.ceil(count / pageSize) || 1;
        state.totalUsers = count;
        state.error = null;
      })
      .addCase(fetchPublicUsersPaginated.rejected, (state, action) => {
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
