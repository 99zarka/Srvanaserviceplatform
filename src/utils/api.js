// API utility functions for making requests
import BASE_URL from '../config/api.js'; // Import BASE_URL
import { store } from '../redux/store'; // Import Redux store

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
    if (response.ok) {
      return { success: true, message: 'No JSON content' };
    }
    throw new ApiError('Non-JSON response and not OK', response.status, null);
  }
  
  if (!response.ok) {
    console.error("handleResponse: Response not OK, throwing error.", data); // Debugging
    throw new ApiError(
      data.detail || data.message || 'An error occurred',
      response.status,
      data
    );
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
    return handleResponse(response);
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
    return handleResponse(response);
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
    return handleResponse(response);
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
    return handleResponse(response);
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
    
    return handleResponse(response);
  },
};

export default api;
