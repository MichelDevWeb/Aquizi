'use client';

import { buttonVariants } from "@/components/ui/button";
import { LucideLayoutDashboard, RefreshCw, ChevronLeft, Clock, Award, Share2, Download, Calendar } from "lucide-react";
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
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimeDelta, convertDateToString } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Define Firestore types
interface Game {
  id: string;
  gameType: string;
  timeStarted: Timestamp;
  timeEnded?: Timestamp;
  userId: string;
  topic: string;
  submissionId?: string;
  score?: number;
  totalQuestions?: number;
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

interface Submission {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  timeSpent?: number;
  startTime?: Timestamp;
  endTime?: Timestamp;
  retestCount?: number;
  bestTime?: number;
  averageTime?: number;
  lastRetestTime?: number;
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
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();

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
          
          // Get submission if available
          if (gameData.submissionId) {
            const submissionData = await getDocumentById<Submission>(
              COLLECTIONS.SUBMISSIONS, 
              gameData.submissionId
            );
            if (submissionData) {
              setSubmission(submissionData);
            }
          }
          
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

  const handleRetest = () => {
    if (game) {
      router.push(`/play/${game.gameType}/${game.id}?retest=true&submissionId=${game.submissionId || ''}`);
    }
  };

  const handleShare = () => {
    if (game) {
      // Create a shareable URL
      const shareUrl = `${window.location.origin}/statistics/${game.id}`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: `Quiz Results: ${game.topic}`,
          text: `Check out my quiz results on ${game.topic}! I scored ${accuracy}%`,
          url: shareUrl,
        }).catch(err => {
          console.error('Error sharing:', err);
          // Fallback to copying to clipboard
          copyToClipboard(shareUrl);
        });
      } else {
        // Fallback to copying to clipboard
        copyToClipboard(shareUrl);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "You can now share it with others",
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    });
  };

  if (loading || isLoading) {
    return (
      <div className="p-2 sm:p-4 md:p-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 md:w-40" />
            <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 md:w-40" />
          </div>
        </div>
        <div className="grid gap-2 sm:gap-4 mt-4 sm:mt-6 md:grid-cols-7">
          <Skeleton className="h-32 sm:h-36 md:h-40 col-span-7 md:col-span-3" />
          <Skeleton className="h-32 sm:h-36 md:h-40 col-span-7 md:col-span-2" />
          <Skeleton className="h-32 sm:h-36 md:h-40 col-span-7 md:col-span-2" />
        </div>
        <Skeleton className="h-64 sm:h-80 md:h-96 w-full mt-4 sm:mt-6" />
      </div>
    );
  }

  if (!user || !game || questions.length === 0) {
    return null; // Will redirect in useEffect
  }

  const formattedDate = game.timeEnded ? convertDateToString(game.timeEnded.toDate()) : 'N/A';
  const formattedTime = game.timeEnded ? new Date(game.timeEnded.toDate()).toLocaleTimeString() : 'N/A';
  const timeTaken = game.timeStarted && game.timeEnded 
    ? formatTimeDelta(differenceInSeconds(game.timeEnded.toDate(), game.timeStarted.toDate()))
    : 'N/A';

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{game.topic}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
            <Badge variant={game.gameType === "mcq" ? "default" : "secondary"} className="text-xs sm:text-sm">
              {game.gameType === "mcq" ? t('multipleChoice') : t('openEnded')}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {timeTaken}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" className="h-8 sm:h-10 px-2 sm:px-3" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>{t('dashboard')}</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 sm:h-10 px-2 sm:px-3" onClick={handleShare}>
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>{t('share')}</span>
          </Button>
          <Button size="sm" className="h-8 sm:h-10 px-2 sm:px-3" onClick={handleRetest}>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>{t('retryQuizzes')}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-4 sm:mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-3 sm:mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('overview')}</TabsTrigger>
          <TabsTrigger value="questions" className="text-xs sm:text-sm">{t('questions')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-7">
            <ResultsCard accuracy={accuracy} />
            <AccuracyCard accuracy={accuracy} />
            <TimeTakenCard
              timeEnded={game.timeEnded}
              timeStarted={game.timeStarted}
              bestTime={submission?.bestTime}
              averageTime={submission?.averageTime}
              lastRetestTime={submission?.lastRetestTime}
              retestCount={submission?.retestCount}
            />
          </div>
          
          <div className="grid gap-3 sm:gap-4 mt-4 sm:mt-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">{t('quizDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
                <dl className="space-y-1 sm:space-y-2 md:space-y-4 text-xs sm:text-sm md:text-base">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('topic')}</dt>
                    <dd className="text-right">{game.topic}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('quizType')}</dt>
                    <dd className="text-right">{game.gameType === "mcq" ? t('multipleChoice') : t('openEnded')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('questions')}</dt>
                    <dd className="text-right">{questions.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('dateCompleted')}</dt>
                    <dd className="text-right">{formattedDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('timeCompleted')}</dt>
                    <dd className="text-right">{formattedTime}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">{t('performanceSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
                <dl className="space-y-1 sm:space-y-2 md:space-y-4 text-xs sm:text-sm md:text-base">
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('score')}</dt>
                    <dd className="text-right">{game.score || 0} / {game.totalQuestions || questions.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('accuracy')}</dt>
                    <dd className="text-right">{accuracy}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-muted-foreground">{t('timeTaken')}</dt>
                    <dd className="text-right">{timeTaken}</dd>
                  </div>
                  {submission?.timeSpent && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-muted-foreground">Average Time per Question</dt>
                      <dd className="text-right">{formatTimeDelta(Math.round(submission.timeSpent / questions.length))}</dd>
                    </div>
                  )}
                  {submission?.retestCount !== undefined && submission.retestCount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <dt className="font-medium text-muted-foreground">Retest Count</dt>
                        <dd className="text-right">{submission.retestCount}</dd>
                      </div>
                      {submission.bestTime && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-muted-foreground">{t('bestTime')}</dt>
                          <dd className="text-right">{formatTimeDelta(submission.bestTime)}</dd>
                        </div>
                      )}
                      {submission.averageTime && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-muted-foreground">{t('averageTime')}</dt>
                          <dd className="text-right">{formatTimeDelta(Math.round(submission.averageTime))}</dd>
                        </div>
                      )}
                      {submission.lastRetestTime && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-muted-foreground">{t('lastRetest')}</dt>
                          <dd className="text-right">{formatTimeDelta(submission.lastRetestTime)}</dd>
                        </div>
                      )}
                    </>
                  )}
                  {submission?.updatedAt && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-muted-foreground">Last Retested</dt>
                      <dd className="text-right">{convertDateToString(submission.updatedAt.toDate())}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="questions">
          <QuestionsList questions={questions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
