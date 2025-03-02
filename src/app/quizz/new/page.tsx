'use client';

import UploadDoc from "../UploadDoc";
import { getUserSubscription } from "@/actions/userSubscriptions";
import { Lock, Flame } from "lucide-react";
import { getStripe } from "@/lib/stripe-client";
import { useRouter } from "next/navigation";
import { PRICE_ID } from "@/lib/utils";
import UpgradePlan from "../UpgradePlan";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const NewQuizPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
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
          const subscription = await getUserSubscription({
            userId: user.uid,
          });
          setSubscribed(subscription ?? false);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscribed(false); // Default to not subscribed if there's an error
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
      <div className="flex flex-col flex-1">
        <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
          <Skeleton className="h-10 w-96 mb-4" />
          <Skeleton className="h-64 w-full max-w-md" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
        {subscribed ? (
          <>
            <h2 className="text-3xl font-bold mb-4">
              What do you want to be quizzed about today?
            </h2>
            <UploadDoc />
          </>
        ) : (
          <UpgradePlan />
        )}
      </main>
    </div>
  );
};

export default NewQuizPage; 