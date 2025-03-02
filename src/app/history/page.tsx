'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HistoryComponent from "@/components/HistoryComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCheck, Edit2, History } from "lucide-react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Skeleton } from "@/components/ui/skeleton";

const HistoryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col items-start gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
        <p className="text-muted-foreground">
          View your past quiz attempts and performance.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">All Quizzes</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="mcq" className="flex items-center gap-2">
            <CopyCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Multiple Choice</span>
            <span className="sm:hidden">MCQ</span>
          </TabsTrigger>
          <TabsTrigger value="open-ended" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Open-Ended</span>
            <span className="sm:hidden">Open</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <HistoryComponent limit={10} userId={user.uid} gameType={null} />
        </TabsContent>
        
        <TabsContent value="mcq">
          <HistoryComponent limit={10} userId={user.uid} gameType="mcq" />
        </TabsContent>
        
        <TabsContent value="open-ended">
          <HistoryComponent limit={10} userId={user.uid} gameType="open-ended" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryPage;
