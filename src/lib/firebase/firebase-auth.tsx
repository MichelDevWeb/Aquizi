'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './firebase-config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add user to Firestore
  const createUserDocument = async (user: User, additionalData = {}) => {
    if (!user) return;

    // Reference to user document
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user document exists
    const snapshot = await getDoc(userRef);
    
    // If user document doesn't exist, create it
    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      
      try {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          createdAt: serverTimestamp(),
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document', error);
      }
    }
    
    return userRef;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing in with Google', error);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing in with email', error);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await createUserDocument(result.user);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing up with email', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      console.error('Error resetting password', error);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing out', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 