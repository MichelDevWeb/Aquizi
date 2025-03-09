// This file is for typing environment variables and providing defaults
// We don't need to dynamically load .env files here as Next.js handles that

/**
 * Environment variables are loaded by Next.js based on NODE_ENV:
 * - In development: .env.local
 * - In production: .env.prod
 * - In test: .env.test
 * 
 * This file just provides typed access to those variables
 */

// Export environment variables with proper typing
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || '',
  FIREBASE_CONFIG: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  },
  // Add other environment variables as needed
}; 