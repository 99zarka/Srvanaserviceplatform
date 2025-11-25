// API utility functions for making requests
import BASE_URL from '../config/api.js';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.detail || data.message || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data;
};

const getAuthToken = () => {
  // Try to get token from localStorage first (if stored there)
  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;
  
  // Try to get token from sessionStorage (more common for SPAs)
  const sessionToken = sessionStorage.getItem('access_token');
  if (sessionToken) return sessionToken;
  
  // Try to get token from cookie (fallback)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
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
    return handleResponse(response);
  },
};

export default api;
