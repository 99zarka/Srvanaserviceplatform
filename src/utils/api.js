// API utility functions for making requests
import BASE_URL from '../config/api.js'; // Import BASE_URL
import { store } from '../redux/store'; // Import Redux store
import { logout } from '../redux/authSlice'; // Import logout action
import { addNotification } from '../redux/notificationSlice'; // Assuming this action exists

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  console.log("handleResponse: Raw Response Status:", response.status); // Debugging
  console.log("handleResponse: Raw Response OK:", response.ok);     // Debugging

  if (response.status === 204) {
    return { success: true };
  }

  let data;
  try {
    data = await response.json();
    console.log("handleResponse: Parsed JSON Data:", data); // Debugging
  } catch (e) {
    console.error("handleResponse: Error parsing JSON:", e); // Debugging
    // If response is not OK and not JSON, it's still an error
    if (!response.ok) {
      const errorMsg = `Server error: ${response.statusText || 'Unknown error'}`;
      store.dispatch(addNotification({ message: errorMsg, type: 'error' }));
      throw new ApiError(errorMsg, response.status, null);
    }
    // If response is OK but no JSON content, it's not an error, just no content
    return { success: true, message: 'No JSON content' };
  }
  
  if (!response.ok) {
    console.error("handleResponse: Response not OK, throwing error.", data); // Debugging
    const errorMessage = data.detail || data.message || 'An error occurred';

    // Global error handling:
    store.dispatch(addNotification({ message: errorMessage, type: 'error' }));

    // Specific handling for authentication errors
    if (response.status === 401 || response.status === 403) {
      store.dispatch(logout()); // Dispatch logout action
      store.dispatch(addNotification({ message: 'Session expired or unauthorized. Please log in again.', type: 'warning' }));
    }

    throw new ApiError(errorMessage, response.status, data);
  }
  
  return data;
};

// Use Redux store to get authentication token
const getAuthToken = () => {
  try {
    // Get token from Redux store
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      return token;
    }
  } catch (error) {
    console.error('Error accessing Redux store for token:', error);
  }
  
  return null; // Return null if no token found or error occurs
};

const api = {
  async get(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    const result = await handleResponse(response); // Await handleResponse
    console.log("api.get: Result from handleResponse:", result); // New debug log
    return result;
  },

  async post(endpoint, data, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    };
    
    const response = await fetch(url, config);
    const result = await handleResponse(response); // Await handleResponse
    console.log("api.post: Result from handleResponse:", result); // New debug log
    return result;
  },

  async put(endpoint, data, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    };
    
    const response = await fetch(url, config);
    const result = await handleResponse(response); // Await handleResponse
    console.log("api.put: Result from handleResponse:", result); // New debug log
    return result;
  },

  async patch(endpoint, data, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    };
    
    const response = await fetch(url, config);
    const result = await handleResponse(response); // Await handleResponse
    console.log("api.patch: Result from handleResponse:", result); // New debug log
    return result;
  },

  async delete(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (response.status === 204) {
      return { success: true };
    }
    
    const result = await handleResponse(response); // Await handleResponse
    console.log("api.delete: Result from handleResponse:", result); // New debug log
    return result;
  },
};

export default api;
