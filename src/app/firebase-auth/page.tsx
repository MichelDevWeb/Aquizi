'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FirebaseSignInButton from '@/components/FirebaseSignInButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/firebase/firebase-auth';

const FirebaseAuthPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="justify-center p-8 mx-auto max-w-7xl">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Firebase Authentication</CardTitle>
            <CardDescription>
              Sign in with Firebase to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseSignInButton text="Sign In with Google" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FirebaseAuthPage; 