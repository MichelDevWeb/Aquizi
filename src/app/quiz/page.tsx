'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizCreation from "@/components/forms/QuizCreation";
import { useAuth } from "@/lib/firebase/firebase-auth";
import PageLayout from "@/components/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  searchParams: {
    topic?: string;
  };
}

const Quiz = ({ searchParams }: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <PageLayout contentWidth="medium" mobilePadding="small" className="py-2 sm:py-4 md:py-6" mobileStack={true}>
        <Skeleton className="h-10 sm:h-12 w-48 sm:w-64 mb-4 sm:mb-6" />
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 sm:h-32 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout contentWidth="medium" mobilePadding="small" className="py-2 sm:py-4 md:py-6" mobileStack={true} safePaddingBottom={true}>
      <QuizCreation topic={searchParams.topic ?? ""} />
    </PageLayout>
  );
};

export default Quiz;
