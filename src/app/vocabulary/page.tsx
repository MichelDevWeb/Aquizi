"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Vocabulary, Score } from "@/components/vocabulary/types";
import { GameControls } from "@/components/vocabulary/GameControls";
import { WelcomeScreen } from "@/components/vocabulary/WelcomeScreen";
import { GameCompletedScreen } from "@/components/vocabulary/GameCompletedScreen";
import { VocabularyGame } from "@/components/vocabulary/VocabularyGame";
import { ScoresTab } from "@/components/vocabulary/ScoresTab";
import { LeaderboardTab } from "@/components/vocabulary/LeaderboardTab";
import { QuickGuide } from "@/components/vocabulary/QuickGuide";
import { LearningTips } from "@/components/vocabulary/LearningTips";
import { ProgressTracker } from "@/components/vocabulary/ProgressTracker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Game tab skeleton
const GameTabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      <Skeleton className="h-7 w-28 rounded-md" />
    </div>
    
    <div className="rounded-lg border overflow-hidden">
      <Skeleton className="h-16 w-full rounded-t-lg" />
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-12 w-full mt-4" />
        </div>
      </div>
    </div>
  </div>
);

// Scores tab skeleton
const ScoresTabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="rounded-lg border">
      <Skeleton className="h-14 w-full rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-40 my-2" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Leaderboard tab skeleton
const LeaderboardTabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="rounded-lg border">
      <Skeleton className="h-14 w-full rounded-t-lg" />
      <div className="p-4 space-y-4">
        <div className="flex justify-center items-end h-28 mb-6 mt-2">
          {/* Second place */}
          <div className="flex flex-col items-center mx-2">
            <Skeleton className="h-14 w-14 rounded-full mb-2" />
            <Skeleton className="h-20 w-16 rounded-t-md" />
          </div>
          {/* First place */}
          <div className="flex flex-col items-center mx-2">
            <Skeleton className="h-16 w-16 rounded-full mb-2" />
            <Skeleton className="h-24 w-20 rounded-t-md" />
          </div>
          {/* Third place */}
          <div className="flex flex-col items-center mx-2">
            <Skeleton className="h-12 w-12 rounded-full mb-2" />
            <Skeleton className="h-16 w-14 rounded-t-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-40 mb-2" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function VocabularyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  
  // State management
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [wordCount, setWordCount] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<string>("game");
  
  // Refs
  const gameTabRef = useRef<HTMLButtonElement>(null);
  const scoresTabRef = useRef<HTMLButtonElement>(null);
  const leaderboardTabRef = useRef<HTMLButtonElement>(null);

  // Fetch data on initial load and user change
  useEffect(() => {
    // Initial data loading based on current tab
    if (user) {
      const currentTab = activeTab;
      if (currentTab === "scores") {
        fetchScores();
      } else if (currentTab === "leaderboard") {
        fetchLeaderboard();
      }
    }
    // Only run this effect on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | null): string => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Navigation helper
  const navigateToGameTab = () => {
    setActiveTab("game");
    setLoading(true);
  };

  // Navigate to scores tab
  const navigateToScoresTab = () => {
    setActiveTab("scores");
    if (user) {
      fetchScores();
    }
  };
  
  // Navigate to leaderboard tab
  const navigateToLeaderboardTab = () => {
    setActiveTab("leaderboard");
    if (user) {
      fetchLeaderboard();
    }
  };

  // API calls
  const fetchVocabulary = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      
      // Build query string directly
      let queryString = "";
      if (difficulty && difficulty !== "all") {
        queryString += `difficulty=${difficulty}&`;
      }
      queryString += `count=${wordCount}&useCache=${useCache}`;
      
      // Add userId parameter if user is logged in
      if (user) {
        queryString += `&userId=${user.uid}`;
      }
      
      const response = await fetch(`/api/vocabulary/generate?${queryString}`);
      const data = await response.json();
      
      if (data.vocabulary) {
        setVocabulary(data.vocabulary);
        
        // Show appropriate toast based on source of vocabulary
        if (data.source === "database") {
          // Using stored words from database
          toast({
            title: "Using Existing Words",
            description: "Using vocabulary words already in our database",
            variant: "default",
            className: "bg-primary text-primary-foreground border-primary shadow-lg font-medium",
          });
        } else if (data.source === "mixed") {
          // Mixed source - cached and generated
          toast({
            title: t('smartLearning'),
            description: t('smartLearningActiveMessage'),
            variant: "default",
            className: "bg-indigo-600 text-white border-indigo-700 shadow-lg font-medium",
          });
        } else if (data.source === "generated") {
          // All words are newly generated
          toast({
            title: "New Words Generated",
            description: "We've generated new words for you to learn",
            variant: "default",
            className: "bg-amber-500 text-amber-950 border-amber-600 shadow-lg font-medium",
          });
        } else if (data.source === "played_before") {
          // Words user has seen before
          toast({
            title: "Practice Words",
            description: "We've selected words you've practiced before",
            variant: "default",
            className: "bg-blue-600 text-white border-blue-700 shadow-lg font-medium",
          });
        }
        
        // Generate speech for each word
        for (const word of data.vocabulary) {
          if (!word.audioUrl) {
            generateSpeech(word.word, word.id);
          }
        }
        
        // Reset game state
        setCorrectWords([]);
        setIncorrectWords([]);
        setScore(0);
        setGameCompleted(false);
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vocabulary",
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async (word: string, documentId: string) => {
    try {
      const response = await fetch("/api/vocabulary/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word, documentId }),
      });
      
      const data = await response.json();
      
      if (data.audioUrl) {
        setVocabulary((prev) => 
          prev.map((v) => 
            v.id === documentId ? { ...v, audioUrl: data.audioUrl } : v
          )
        );
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      // Silent fail - don't show error to user for speech generation
      // as it's not critical to gameplay
    }
  };

  const fetchScores = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/vocabulary/score?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.scores) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vocabulary/score?leaderboard=true");
      const data = await response.json();
      
      if (data.scores) {
        setLeaderboard(data.scores);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/vocabulary/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          username: user.displayName || `User-${user.uid.substring(0, 5)}`,
          score,
          wordsCorrect: correctWords,
          wordsIncorrect: incorrectWords,
        }),
      });
      
      const data = await response.json();
      
      if (data.id) {
        toast({
          title: "Score Saved",
          description: "Your vocabulary practice results have been saved",
          variant: "default",
          className: "bg-green-600 text-white border-green-700 shadow-lg font-medium",
        });
      }
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: t('error'),
        description: "Failed to save your score",
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700 shadow-lg font-medium",
      });
    }
  };

  const generateNewGame = async (): Promise<void> => {
    // Generate fresh vocabulary for a new game, prioritizing unseen words
    return await fetchVocabulary(true);
  };
  
  const practiceSeenWords = async (): Promise<void> => {
    // Specifically practice words the user has seen before
    return await fetchVocabulary(false);
  };

  const handleGameCompletion = (completed: boolean) => {
    setGameCompleted(completed);
    if (completed) {
      saveScore();
    }
  };

  // Render game content based on state
  const renderGameContent = () => {
    if (loading && vocabulary.length === 0) {
      return <GameTabSkeleton />;
    }
    
    if (gameCompleted) {
      return (
        <GameCompletedScreen 
          score={{
            id: Date.now().toString(),
            userId: user?.uid || 'anonymous',
            username: user?.displayName || `User-${user?.uid?.substring(0, 5)}`,
            score: score,
            wordsCorrect: correctWords,
            wordsIncorrect: incorrectWords,
            createdAt: new Date()
          }}
          onPlayAgain={() => {
            setGameCompleted(false);
            practiceSeenWords();
          }}
          onNewGame={() => {
            setGameCompleted(false);
            generateNewGame();
          }}
        />
      );
    }
    
    if (vocabulary.length > 0) {
      return (
        <VocabularyGame 
          vocabulary={vocabulary}
          loading={loading}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          wordCount={wordCount}
          setWordCount={setWordCount}
          fetchVocabulary={generateNewGame}
          correctWords={correctWords}
          incorrectWords={incorrectWords}
          score={score}
          setCorrectWords={setCorrectWords}
          setIncorrectWords={setIncorrectWords}
          setScore={setScore}
          setGameCompleted={handleGameCompletion}
        />
      );
    }
    
    return (
      <WelcomeScreen 
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        wordCount={wordCount}
        setWordCount={setWordCount}
        onStartGame={generateNewGame}
      />
    );
  };

  return (
    <div className="container max-w-6xl py-2 sm:py-4 md:py-6">
      {/* Main content */}
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div>
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              
              // Fetch data when tab changes
              if (user) {
                if (value === "scores") {
                  fetchScores();
                } else if (value === "leaderboard") {
                  fetchLeaderboard();
                }
              }
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="game" ref={gameTabRef}>{t('game')}</TabsTrigger>
              <TabsTrigger value="scores" ref={scoresTabRef}>{t('yourScores')}</TabsTrigger>
              <TabsTrigger value="leaderboard" ref={leaderboardTabRef}>{t('leaderboard')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="game" className="mt-0">
              {!gameCompleted && vocabulary.length > 0 && !loading && (
                <GameControls 
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  wordCount={wordCount}
                  setWordCount={setWordCount}
                  fetchVocabulary={generateNewGame}
                  loading={loading}
                />
              )}
              
              {renderGameContent()}
            </TabsContent>
            
            <TabsContent value="scores" className="mt-0">
              {loading ? (
                <ScoresTabSkeleton />
              ) : (
                <ScoresTab 
                  scores={scores}
                  formatDate={formatDate}
                  userId={user?.uid}
                />
              )}
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-0">
              {loading ? (
                <LeaderboardTabSkeleton />
              ) : (
                <LeaderboardTab 
                  leaderboard={leaderboard}
                  userId={user?.uid}
                  formatDate={formatDate}
                  navigateToGameTab={navigateToGameTab}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - Hide on mobile, show as accordion at the bottom */}
        <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-0 md:block">
          <Accordion type="multiple" defaultValue={["guide"]} className="md:block">
            <AccordionItem value="guide">
              <AccordionTrigger className="text-base font-medium">{t('howToPlay')}</AccordionTrigger>
              <AccordionContent>
                <QuickGuide />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="tips">
              <AccordionTrigger className="text-base font-medium">{t('learningTips')}</AccordionTrigger>
              <AccordionContent>
                <LearningTips />
              </AccordionContent>
            </AccordionItem>
            
            {user && scores.length > 0 && (
              <AccordionItem value="progress">
                <AccordionTrigger className="text-base font-medium">{t('yourProgress')}</AccordionTrigger>
                <AccordionContent>
                  <ProgressTracker scores={scores} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
} 