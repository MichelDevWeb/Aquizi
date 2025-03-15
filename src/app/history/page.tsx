'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HistoryComponent from "@/components/HistoryComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCheck, Edit2, History } from "lucide-react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const HistoryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <PageLayout contentWidth="wide" mobilePadding="medium" mobileStack={true}>
        <div className="flex flex-col items-start gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout contentWidth="wide" mobilePadding="medium" mobileStack={true}>
      <div className="flex flex-col items-start gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('quizHistory')}</h1>
        <p className="text-muted-foreground">
          {t('historyDesc')}
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto flex-nowrap">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t('viewAll')}</span>
            <span className="sm:hidden">{t('viewAll')}</span>
          </TabsTrigger>
          <TabsTrigger value="mcq" className="flex items-center gap-2">
            <CopyCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t('multipleChoice')}</span>
            <span className="sm:hidden">MCQ</span>
          </TabsTrigger>
          <TabsTrigger value="open-ended" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('openEnded')}</span>
            <span className="sm:hidden">{t('openEnded')}</span>
          </TabsTrigger>
        </TabsList>

        <div className="overflow-x-auto pb-4">
          <TabsContent value="all">
            <HistoryComponent limit={10} userId={user.uid} gameType={null} />
          </TabsContent>
          
          <TabsContent value="mcq">
            <HistoryComponent limit={10} userId={user.uid} gameType="mcq" />
          </TabsContent>
          
          <TabsContent value="open-ended">
            <HistoryComponent limit={10} userId={user.uid} gameType="open-ended" />
          </TabsContent>
        </div>
      </Tabs>
    </PageLayout>
  );
};

export default HistoryPage;
