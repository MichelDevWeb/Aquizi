import axios from 'axios';
import { auth } from './firebase/firebase-config';
import { getBaseUrl } from './utils';

// Create a custom axios instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Firebase ID token in all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('No authenticated user found when making API request');
        return config;
      }
      
      try {
        // Force token refresh to ensure we have the latest token
        const token = await user.getIdToken(true);
        
        if (!token) {
          console.error('Failed to get ID token - token is null or empty');
          return config;
        }
        
        // Set the Authorization header with the token
        config.headers.Authorization = `Bearer ${token}`;
        
        // Log the token for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Using token for request:', token.substring(0, 10) + '...');
        }
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error in API request:', error.response.data);
      // You could trigger a sign-out or token refresh here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient; 