'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/firebase-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDocumentById } from '@/lib/firestore/firestore-utils';

interface UserData {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: any;
}

const FirebaseDashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getDocumentById<UserData>('users', user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your Firebase user information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user.photoURL && (
              <div className="flex justify-center">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-24 h-24 rounded-full"
                />
              </div>
            )}
            <div>
              <p className="font-semibold">Name:</p>
              <p>{user.displayName || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{user.email || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">User ID:</p>
              <p className="text-sm break-all">{user.uid}</p>
            </div>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firestore Data</CardTitle>
            <CardDescription>Your data from Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            {userData ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold">Display Name:</p>
                  <p>{userData.displayName || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>{userData.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Created At:</p>
                  <p>
                    {userData.createdAt && userData.createdAt.toDate 
                      ? userData.createdAt.toDate().toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p>No Firestore data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseDashboardPage; 