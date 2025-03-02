import axios from 'axios';
import { auth } from './firebase/firebase-config';

// Create a custom axios instance
const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Firebase ID token in all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current user
      const user = auth.currentUser;
      
      if (user) {
        // Get the ID token
        const token = await user.getIdToken(true);
        
        // Add the token to the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 