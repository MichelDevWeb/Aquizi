'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/firebase-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import Image from "next/image";
const FirebaseDashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/firebase-auth");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/firebase-auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Firebase Dashboard</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your Firebase Authentication details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user.photoURL && (
              <div className="flex justify-center mb-4">
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  className="rounded-full w-24 h-24"
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
      </div>
    </PageLayout>
  );
};

export default FirebaseDashboardPage; 