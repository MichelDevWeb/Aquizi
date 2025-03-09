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
      console.error('Firebase Admin SDK environment variables are missing', {
        projectId: !!process.env.FIREBASE_PROJECT_ID,
        clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: !!process.env.FIREBASE_PRIVATE_KEY
      });
      return;
    }

    try {
      // Handle different formats of private key that might come from environment variables
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // If the key doesn't contain newlines, it might be a JSON-escaped string
      if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // If the key is wrapped in quotes (happens in some environments), remove them
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }
} 