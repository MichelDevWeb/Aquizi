'use client';

import { Clock, CopyCheck, Edit2, Trophy, Timer, Calendar, BarChart, BookOpen, Target, Brain, RefreshCw } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { convertDateToString, formatTimeDelta } from "@/lib/utils";
import { getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where, orderBy, limit as firestoreLimit, QueryConstraint, Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInSeconds } from "date-fns";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

// Define Firestore types
interface Game {
  id: string;
  gameType: string;
  timeStarted: Timestamp;
  timeEnded?: Timestamp;
  userId: string;
  topic: string;
  score?: number;
  totalQuestions?: number;
  submissionId?: string;
}

type Props = {
  limit: number;
  userId: string;
  gameType: string | null;
};

const HistoryComponent = ({ limit, userId, gameType }: Props) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const constraints: QueryConstraint[] = [
          where(FIELDS.GAME.USER_ID, "==", userId),
          orderBy(FIELDS.GAME.TIME_STARTED, "desc"),
          firestoreLimit(limit)
        ];

        // Add gameType filter if provided
        if (gameType) {
          constraints.push(where(FIELDS.GAME.GAME_TYPE, "==", gameType));
        }

        const fetchedGames = await getDocuments<Game>(
          COLLECTIONS.GAMES,
          constraints
        );
        
        setGames(fetchedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [limit, userId, gameType]);

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col p-3 sm:p-4 border rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg text-center">
        <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-primary/10 rounded-full">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('noQuizzesYet')}</h3>
        <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{t('noQuizzesDesc')}</p>
        <Link href="/quiz" className={buttonVariants({ size: "sm" })}>
          {t('takeQuiz')}
        </Link>
      </div>
    );
  }

  // Function to get icon based on topic
  const getTopicIcon = (topic: string) => {
    const lowercaseTopic = topic.toLowerCase();
    if (lowercaseTopic.includes('math') || lowercaseTopic.includes('calculus') || lowercaseTopic.includes('algebra')) {
      return <Brain className="text-blue-500" />;
    } else if (lowercaseTopic.includes('science') || lowercaseTopic.includes('physics') || lowercaseTopic.includes('chemistry')) {
      return <Target className="text-green-500" />;
    } else if (lowercaseTopic.includes('history') || lowercaseTopic.includes('literature') || lowercaseTopic.includes('english')) {
      return <BookOpen className="text-amber-500" />;
    } else {
      return gameType === "mcq" ? <CopyCheck className="text-primary" /> : <Edit2 className="text-primary" />;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {games.map((game: Game) => {
        // Convert Firestore Timestamps to JavaScript Date objects
        const startDate = game.timeStarted?.toDate ? game.timeStarted.toDate() : null;
        const endDate = game.timeEnded?.toDate ? game.timeEnded.toDate() : null;
        
        // Calculate duration only if both dates are valid
        const duration = startDate && endDate ? differenceInSeconds(endDate, startDate) : null;
        
        // Calculate score percentage if available
        const scorePercentage = game.score !== undefined && game.totalQuestions 
          ? Math.round((game.score / game.totalQuestions) * 100) 
          : null;
          
        return (
          <div
            className="flex flex-col p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            key={game.id}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {game.gameType === 'mcq' ? (
                      <CopyCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    ) : (
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">
                      {game.gameType === 'mcq' ? t('multipleChoice') : t('openEnded')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {startDate ? convertDateToString(startDate) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {scorePercentage !== null && (
                  <Badge variant={scorePercentage === 100 ? "success" : "default"} className="text-xs">
                    {scorePercentage}%
                  </Badge>
                )}
                {duration && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs">
                          <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          {formatTimeDelta(duration)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{t('timeTaken')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex gap-1 sm:gap-2">
                  <Link
                    href={`/statistics/${game.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "icon" }),
                      "h-6 w-6 sm:h-8 sm:w-8"
                    )}
                  >
                    <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                  {game.gameType === 'mcq' && (
                    <Link
                      href={`/play/${game.gameType}/${game.id}?retest=true&submissionId=${game.submissionId}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "h-6 w-6 sm:h-8 sm:w-8"
                      )}
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 mt-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                Topic: {game.topic}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryComponent;
