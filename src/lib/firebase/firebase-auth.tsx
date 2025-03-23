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
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
  AuthErrorCodes,
  UserCredential,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, db } from './firebase-config';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from "@/components/ui/use-toast";

// More specific error type
export type AuthError = {
  code: string;
  message: string;
};

// Extended user profile data
interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLogin?: any;
  emailVerified: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
  accountType: 'email' | 'google' | 'other';
}

export type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialLoading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  verifyEmail: () => Promise<void>;
  clearError: () => void;
};

interface CachedUserData {
  userData: UserProfile;
  expiresAt: number;
}

// Parse Firebase auth error codes to readable messages
export const getReadableErrorMessage = (error: any): AuthError => {
  const errorCode = error?.code || '';
  let message = error?.message || 'An unknown error occurred';
  
  // Clean up Firebase error message
  if (message.includes('Firebase:')) {
    message = message.split('Firebase:')[1].trim();
    if (message.includes('(auth/')) {
      message = message.split('(auth/')[0].trim();
    }
  }
  
  // Map common error codes to readable messages
  switch (errorCode) {
    case AuthErrorCodes.USER_DELETED:
      return { code: errorCode, message: 'No account found with this email' };
    case AuthErrorCodes.INVALID_PASSWORD:
      return { code: errorCode, message: 'Incorrect password' };
    case AuthErrorCodes.EMAIL_EXISTS:
      return { code: errorCode, message: 'Email already in use' };
    case AuthErrorCodes.WEAK_PASSWORD:
      return { code: errorCode, message: 'Password should be at least 6 characters' };
    case AuthErrorCodes.INVALID_EMAIL:
      return { code: errorCode, message: 'Invalid email format' };
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return { code: errorCode, message: 'Too many failed attempts. Please try again later.' };
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return { code: errorCode, message: 'Network error. Please check your internet connection.' };
    default:
      return { code: errorCode, message };
  }
};

// Cache expiration time (4 hours in milliseconds)
const CACHE_EXPIRATION = 4 * 60 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [userCache, setUserCache] = useState<{[key: string]: CachedUserData}>({});

  // Clear error state
  const clearError = () => setError(null);

  // Listen for auth state changes
  useEffect(() => {
    setLoading(true); // Set loading to true during auth state initialization
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Create or update user document in Firestore when user signs in
          const userData = await getUserDocument(user);
          if (userData) {
            setUserProfile(userData);
            
            // Update lastLogin if it's been more than an hour since last login
            const lastLogin = userData.lastLogin?.toDate?.();
            const now = new Date();
            if (!lastLogin || now.getTime() - lastLogin.getTime() > 3600000) {
              try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                  lastLogin: serverTimestamp()
                });
              } catch (error) {
                console.error('Error updating last login time', error);
              }
            }
          }
        } else {
          setUserProfile(null);
        }
        setUser(user);
      } catch (err) {
        console.error('Error during auth state change', err);
      } finally {
        setLoading(false); // Set loading to false after auth state is processed
        setInitialLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get user data from cache or Firestore
  const getUserDocument = async (user: User, forceRefresh = false): Promise<UserProfile | null> => {
    if (!user) return null;
    
    const now = Date.now();
    const cachedData = userCache[user.uid];
    
    // Return cached data if it exists and hasn't expired
    if (!forceRefresh && cachedData && cachedData.expiresAt > now) {
      console.log('Using cached user data');
      return cachedData.userData;
    }
    
    // If no valid cache, fetch from Firestore
    console.log('Fetching user data from Firestore');
    try {
      // Reference to user document
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user document exists
      const snapshot = await getDoc(userRef);
      
      let userData: UserProfile;
      
      // If user document doesn't exist, create it
      if (!snapshot.exists()) {
        const { email, displayName, photoURL, emailVerified, providerData } = user;
        
        // Determine account type based on provider
        const accountType = providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
        
        userData = {
          displayName,
          email,
          photoURL,
          emailVerified,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          accountType,
          preferences: {
            theme: 'system',
            language: 'en'
          }
        };
        
        await setDoc(userRef, userData);
      } else {
        const data = snapshot.data();
        userData = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          ...data
        } as UserProfile;
      }
      
      // Cache the user data
      setUserCache(prev => ({
        ...prev,
        [user.uid]: {
          userData,
          expiresAt: now + CACHE_EXPIRATION
        }
      }));
      
      return userData;
    } catch (error) {
      console.error('Error fetching/creating user document', error);
      return null;
    }
  };

  // Manually refresh user data
  const refreshUserData = async (): Promise<UserProfile | null> => {
    if (user) {
      const userData = await getUserDocument(user, true);
      if (userData) {
        setUserProfile(userData);
      }
      return userData;
    }
    return null;
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create Firestore document for new Google users
      if (userCredential.user) {
        // Check if user already exists in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);
        const isNewUser = !userDoc.exists();
        
        if (isNewUser) {
          // Explicitly create Firestore document for new Google users
          const { displayName, email, photoURL, emailVerified } = userCredential.user;
          
          await setDoc(userRef, {
            displayName,
            email,
            photoURL,
            emailVerified,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            accountType: 'google',
            preferences: {
              theme: 'system',
              language: 'en'
            }
          });
          
          toast({
            title: "Account created",
            description: "Your Google account has been successfully connected.",
            variant: "default",
            className: "bg-green-600 text-white border-green-700 shadow-lg font-medium"
          });
        } else {
          toast({
            title: "Sign in successful",
            description: "Welcome back!",
            variant: "default",
            className: "bg-green-600 text-white border-green-700 shadow-lg font-medium"
          });
        }
      }
    } catch (err: any) {
      console.error('Error signing in with Google', err);
      const readableError = getReadableErrorMessage(err);
      setError(readableError);
      
      toast({
        title: "Google sign in failed",
        description: readableError.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set persistence based on remember me option
      const persistence = rememberMe 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);
      
      // Show success toast
      toast({
        title: "Sign in successful",
        description: "Welcome back!",
        variant: "default",
        className: "bg-green-600 text-white border-green-700 shadow-lg font-medium"
      });
    } catch (err: any) {
      console.error("Sign in error:", err);
      const readableError = getReadableErrorMessage(err);
      setError(readableError);
      
      // Show error toast
      toast({
        title: "Sign in failed",
        description: readableError.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile if display name is provided
      if (displayName && user) {
        await updateProfile(user, { displayName });
      }
      
      // Always send email verification
      if (user) {
        await sendEmailVerification(user);
        
        // Create Firestore document for new user
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          displayName: displayName || null,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          accountType: 'email',
          preferences: {
            theme: 'system',
            language: 'en'
          }
        });
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please verify your email.",
        variant: "default",
        className: "bg-green-600 text-white border-green-700 shadow-lg font-medium"
      });
    } catch (err: any) {
      console.error("Sign up error:", err);
      const readableError = getReadableErrorMessage(err);
      setError(readableError);
      
      toast({
        title: "Sign up failed",
        description: readableError.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await sendPasswordResetEmail(auth, email);
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
        variant: "default",
        className: "bg-green-600 text-white border-green-700 shadow-lg font-medium"
      });
    } catch (err: any) {
      console.error("Password reset error:", err);
      const readableError = getReadableErrorMessage(err);
      setError(readableError);
      
      toast({
        title: "Password reset failed",
        description: readableError.message,
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user password (requires recent login)
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Change password
      await updatePassword(user, newPassword);
    } catch (err: any) {
      console.error("Change password error:", err);
      setError(getReadableErrorMessage(err.code) || "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send email verification
  const verifyEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      await sendEmailVerification(user);
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(getReadableErrorMessage(err.code) || "Failed to send verification email");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update displayName and photoURL in Firebase Auth if provided
      if (data.displayName !== undefined || data.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: data.displayName ?? user.displayName,
          photoURL: data.photoURL ?? user.photoURL
        });
      }
      
      // Update Firestore document with all provided data
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data, 
        updatedAt: serverTimestamp()
      });
      
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user profile', error);
      setError(getReadableErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      
      await firebaseSignOut(auth);
      // Clear the user cache on logout
      setUserCache({});
    } catch (error: any) {
      console.error('Error signing out', error);
      setError(getReadableErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    initialLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    changePassword,
    signOut: logout,
    updateProfile: updateUserProfile,
    verifyEmail,
    clearError
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