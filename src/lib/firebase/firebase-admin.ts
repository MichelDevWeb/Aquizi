import { getApps, initializeApp, cert } from 'firebase-admin/app';

/**
 * Initialize Firebase Admin SDK
 * This is used for server-side authentication and Firestore operations
 */
export function initAdmin() {
  // Only initialize if no apps exist
  if (getApps().length === 0) {
    // Check if we have the required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Firebase Admin SDK environment variables are missing');
      return;
    }

    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be properly formatted as it comes from env with escaped newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      console.log('Firebase Admin SDK initialized');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }
} 