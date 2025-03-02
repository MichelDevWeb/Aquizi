'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizCreation from "@/components/forms/QuizCreation";
import { useAuth } from "@/lib/firebase/firebase-auth";

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
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <QuizCreation topic={searchParams.topic ?? ""} />;
};

export default Quiz;
