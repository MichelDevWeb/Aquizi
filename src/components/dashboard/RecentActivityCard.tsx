'use client';

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HistoryComponent from "../HistoryComponent";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

const RecentActivityCard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gamesCount, setGamesCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth');
    }

    const fetchGamesCount = async () => {
      if (user) {
        try {
          setLoadingCount(true);
          const games = await getDocuments(
            COLLECTIONS.GAMES,
            [where(FIELDS.GAME.USER_ID, "==", user.uid)]
          );
          setGamesCount(games.length);
        } catch (error) {
          console.error("Error fetching games count:", error);
        } finally {
          setLoadingCount(false);
        }
      }
    };

    if (user) {
      fetchGamesCount();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
          <Skeleton className="h-5 sm:h-6 md:h-8 w-28 sm:w-36 md:w-48 mb-1 sm:mb-2" />
          <Skeleton className="h-3 sm:h-3 md:h-4 w-36 sm:w-48 md:w-64" />
        </CardHeader>
        <CardContent className="max-h-[300px] sm:max-h-[400px] md:max-h-[580px] overflow-auto p-2 sm:p-3 md:p-4">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 sm:h-16 md:h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
        <div>
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
            <Link href="/history" className="hover:underline flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Recent Activity
            </Link>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {loadingCount ? (
              <span className="inline-block w-24 sm:w-32 md:w-64 h-2 sm:h-3 md:h-4 bg-muted animate-pulse rounded"></span>
            ) : (
              `You have played a total of ${gamesCount} quizzes.`
            )}
          </CardDescription>
        </div>
        <Link 
          href="/history" 
          className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="max-h-[300px] sm:max-h-[400px] md:max-h-[580px] overflow-auto px-2 sm:px-3 md:px-4">
        {user && <HistoryComponent limit={5} userId={user.uid} gameType={null} />}
        <div className="mt-3 sm:mt-4 text-center sm:hidden">
          <Link 
            href="/history" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View all activity
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
