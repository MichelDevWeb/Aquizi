'use client';

import { Clock, CopyCheck, Edit2, Trophy, Timer, Calendar, BarChart, BookOpen, Target, Brain } from "lucide-react";
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
}

type Props = {
  limit: number;
  userId: string;
  gameType: string | null;
};

const HistoryComponent = ({ limit, userId, gameType }: Props) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Trophy className="w-12 h-12 mb-4 text-yellow-500" />
        <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
        <p className="text-muted-foreground mb-6">
          {gameType 
            ? `You haven't taken any ${gameType === 'mcq' ? 'multiple choice' : 'open-ended'} quizzes yet.` 
            : "You haven't taken any quizzes yet."}
        </p>
        <Link href="/quiz" className={buttonVariants()}>
          Take a Quiz
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
    <div className="space-y-4">
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
            className="flex flex-col p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            key={game.id}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  {getTopicIcon(game.topic)}
                </div>
                <div className="ml-4 flex flex-wrap items-center gap-2">
                  <Link
                    className="text-lg font-medium hover:underline mr-2"
                    href={`/statistics/${game.id}`}
                  >
                    {game.topic}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={game.gameType === "mcq" ? "default" : "secondary"}>
                      {game.gameType === "mcq" ? "Multiple Choice" : "Open-Ended"}
                    </Badge>
                    
                    {scorePercentage !== null && (
                      <Badge 
                        variant={scorePercentage > 70 ? "success" : scorePercentage > 40 ? "warning" : "destructive"} 
                      >
                        {scorePercentage}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/statistics/${game.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 sm:mt-0 w-full sm:w-auto")}
                    >
                      <BarChart className="w-4 h-4 mr-1" /> View Results
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>See detailed statistics for this quiz</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {startDate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {convertDateToString(startDate, true)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Quiz taken on {startDate.toLocaleString()}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {duration && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Timer className="w-4 h-4 mr-1" />
                        {formatTimeDelta(duration)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Time spent: {Math.floor(duration / 60)} minutes {duration % 60} seconds</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {game.totalQuestions && (
                <div className="flex items-center">
                  <CopyCheck className="w-4 h-4 mr-1" />
                  {game.totalQuestions} questions
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryComponent;
