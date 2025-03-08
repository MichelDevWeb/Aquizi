'use client';

import MCQ from "@/components/MCQ";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocumentById, getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where } from "firebase/firestore";

// Define Firestore types
interface Game {
  id: string;
  gameType: string;
  timeStarted: Date;
  timeEnded?: Date;
  userId: string;
  topic: string;
  questionsv2: Question[];
  submissionId?: string;
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
  searchParams?: {
    retest?: string;
    submissionId?: string;
  };
};

const MCQPage = ({ params: { gameId }, searchParams }: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isRetest = searchParams?.retest === 'true';
  const submissionId = searchParams?.submissionId;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchGame = async () => {
      if (user) {
        try {
          // Get game from Firestore
          const gameData = await getDocumentById<Game>(COLLECTIONS.GAMES, gameId);
          
          if (!gameData) {
            router.push("/quiz");
            return;
          }
          
          // Get questions for the game
          const questions = await getDocuments<Question>(
            COLLECTIONS.QUESTIONS,
            [where(FIELDS.QUESTION.GAME_ID, "==", gameId)]
          );
          
          // Add submissionId to game data if this is a retest
          if (isRetest && submissionId) {
            gameData.submissionId = submissionId;
          }
          
          // Add questions to game data
          setGame({
            ...gameData,
            questionsv2: questions,
          });
          
          if (gameData.gameType === "open_ended") {
            router.push("/quiz");
          }
        } catch (error) {
          console.error('Error fetching game:', error);
          router.push("/quiz");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchGame();
    }
  }, [user, gameId, router, isRetest, submissionId]);

  if (loading || isLoading) {
    return (
      <div className="p-8 mx-auto max-w-7xl">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !game) {
    return null; // Will redirect in useEffect
  }

  return <MCQ game={game} />;
};

export default MCQPage;
