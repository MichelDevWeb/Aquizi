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
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="max-h-[580px] overflow-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle className="text-2xl font-bold">
            <Link href="/history" className="hover:underline flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </Link>
          </CardTitle>
          <CardDescription>
            {loadingCount ? (
              <span className="inline-block w-64 h-4 bg-muted animate-pulse rounded"></span>
            ) : (
              `You have played a total of ${gamesCount} quizzes.`
            )}
          </CardDescription>
        </div>
        <Link 
          href="/history" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="max-h-[580px] overflow-auto px-4 sm:px-6">
        {user && <HistoryComponent limit={5} userId={user.uid} gameType={null} />}
        <div className="mt-4 text-center sm:hidden">
          <Link 
            href="/history" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all activity
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
