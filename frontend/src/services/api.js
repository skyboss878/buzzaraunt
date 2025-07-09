
// src/services/api.js
import config from '../config.js';
const API_BASE_URL = config.API_BASE_URL;
class ApiService {
async request(endpoint, options = {}) {
const url = ;
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // if you need cookies
};

const requestOptions = {
  ...defaultOptions,
  ...options,
  headers: {
    ...defaultOptions.headers,
    ...options.headers,
  },
};

try {
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    // Attempt to parse JSON error message from backend
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (jsonError) {
      // If response is not JSON, just use status text
      errorData = { message: response.statusText || 'Unknown error' };
    }
    
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = errorData; // Attach backend error data
    throw error;
  }
  
  return await response.json();
} catch (error) {
  console.error('API request failed:', error);
  throw error;
}

}
// GET request
async get(endpoint) {
return this.request(endpoint);
}
// POST request
async post(endpoint, data) {
return this.request(endpoint, {
method: 'POST',
body: JSON.stringify(data),
});
}
// PUT request
async put(endpoint, data) {
return this.request(endpoint, {
method: 'PUT',
body: JSON.stringify(data),
});
}
// DELETE request
async delete(endpoint) {
return this.request(endpoint, {
method: 'DELETE',
});
}
}
export default new ApiService();
