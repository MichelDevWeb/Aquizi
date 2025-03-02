'use client';

import { buttonVariants } from "@/components/ui/button";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ResultsCard from "@/components/statistics/ResultsCard";
import AccuracyCard from "@/components/statistics/AccuracyCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import QuestionsList from "@/components/statistics/QuestionsList";
import { getDocumentById, getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where } from "firebase/firestore";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Skeleton } from "@/components/ui/skeleton";

// Define Firestore types
interface Game {
  id: string;
  gameType: string;
  timeStarted: Date;
  timeEnded?: Date;
  userId: string;
  topic: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  gameId: string;
  questionType: "mcq" | "open_ended";
  options?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  percentageCorrect?: number;
}

type Props = {
  params: {
    gameId: string;
  };
};

const Statistics = ({ params: { gameId } }: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchGameData = async () => {
      if (user) {
        try {
          // Get game from Firestore
          const gameData = await getDocumentById<Game>(COLLECTIONS.GAMES, gameId);
          
          if (!gameData) {
            router.push("/dashboard");
            return;
          }
          
          setGame(gameData);
          
          // Get questions for the game
          const questionsData = await getDocuments<Question>(
            COLLECTIONS.QUESTIONS,
            [where(FIELDS.QUESTION.GAME_ID, "==", gameId)]
          );
          
          setQuestions(questionsData);
          
          // Calculate accuracy
          let calculatedAccuracy = 0;
          
          if (gameData.gameType === "mcq") {
            let totalCorrect = questionsData.reduce((acc, question) => {
              if (question.isCorrect) {
                return acc + 1;
              }
              return acc;
            }, 0);
            calculatedAccuracy = (totalCorrect / questionsData.length) * 100;
          } else if (gameData.gameType === "open_ended") {
            let totalPercentage = questionsData.reduce((acc, question) => {
              return acc + (question.percentageCorrect ?? 0);
            }, 0);
            calculatedAccuracy = totalPercentage / questionsData.length;
          }
          
          setAccuracy(Math.round(calculatedAccuracy * 100) / 100);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching game data:', error);
          router.push("/dashboard");
        }
      }
    };

    if (user) {
      fetchGameData();
    }
  }, [gameId, user, router]);

  if (loading || isLoading) {
    return (
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <Skeleton className="h-40 col-span-3" />
          <Skeleton className="h-40 col-span-2" />
          <Skeleton className="h-40 col-span-2" />
        </div>
        <Skeleton className="h-96 w-full mt-4" />
      </div>
    );
  }

  if (!user || !game || questions.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard"
              className={buttonVariants()}
            >
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(game.timeEnded ?? 0)}
            timeStarted={new Date(game.timeStarted ?? 0)}
          />
        </div>
        <QuestionsList questions={questions} />
      </div>
    </>
  );
};

export default Statistics;
