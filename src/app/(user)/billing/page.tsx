'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManageSubscription from "./ManageSubscription";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSubscription } from "@/app/actions/userSubscriptions";

const BillingPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user && user.uid) {
        try {
          // Use the Firestore function to get user subscription
          const subscription = await getUserSubscription({
            userId: user.uid,
          });
          
          setPlan(subscription ? "premium" : "free");
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setPlan("free"); // Default to free if there's an error
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="p-4 border rounded-md">
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-4 border rounded-md">
      <h1 className="text-4xl mb-3">Subscription Details</h1>
      <p className="mb-2">You are currently on a {plan || 'free'} plan</p>
      <ManageSubscription />
    </div>
  );
};

export default BillingPage;
