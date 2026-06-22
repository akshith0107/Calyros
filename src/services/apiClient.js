import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log("Current API URL:", apiClient.defaults.baseURL);

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401s and log detailed errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed backend error for debugging
    console.error("API Error Response:", error.response?.data || error.message);
    console.error("API Error Status:", error.response?.status);
    console.error("API Request URL:", error.config?.url);
    
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
