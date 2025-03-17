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
import { useRouter, useSearchParams } from "next/navigation";

export default function VocabularyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
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
  
  // Refs
  const gameTabRef = useRef<HTMLButtonElement>(null);
  const scoresTabRef = useRef<HTMLButtonElement>(null);
  const leaderboardTabRef = useRef<HTMLButtonElement>(null);

  // Fetch data on user change
  useEffect(() => {
    if (user) {
      fetchScores();
      fetchLeaderboard();
    }
  }, [user]);

  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | null): string => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Navigation helper
  const navigateToGameTab = () => {
    if (gameTabRef.current) {
      gameTabRef.current.click();
    }
  };

  // Navigate to scores tab
  const navigateToScoresTab = () => {
    if (scoresTabRef.current) {
      scoresTabRef.current.click();
    }
  };

  // API calls
  const fetchVocabulary = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (difficulty && difficulty !== "all") {
        params.append("difficulty", difficulty);
      }
      params.append("count", wordCount.toString());
      params.append("useCache", useCache.toString());
      
      // Add userId parameter if user is logged in
      if (user) {
        params.append("userId", user.uid);
      }
      
      const response = await fetch(`/api/vocabulary/generate?${params.toString()}`);
      const data = await response.json();
      
      if (data.vocabulary) {
        setVocabulary(data.vocabulary);
        
        // Check if we're getting mixed or generated words
        if (data.source === "mixed" && useCache) {
          toast({
            title: t('smartLearning'),
            description: t('smartLearningActiveMessage'),
            variant: "default",
            className: "bg-primary/10 border-primary/20"
          });
        } else if (data.source === "generated" && useCache) {
          toast({
            title: t('allWordsCompleted'),
            description: t('allWordsCompletedDesc'),
            variant: "default",
            className: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
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
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
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
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
  };

  const fetchScores = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/vocabulary/score?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.scores) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/vocabulary/score?leaderboard=true");
      const data = await response.json();
      
      if (data.scores) {
        setLeaderboard(data.scores);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
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
          title: "Success",
          description: "Score saved successfully!",
          variant: "default",
          className: "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800 dark:text-green-100"
        });
        fetchScores();
        fetchLeaderboard();
      }
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: "Failed to save score",
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
  };

  // Game actions
  const resetGame = () => {
    // Use cached vocabulary when resetting the game
    fetchVocabulary(true);
  };

  const generateNewGame = async (): Promise<void> => {
    // Generate fresh vocabulary for a new game
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
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
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
          vocabulary={vocabulary.map(v => v.word)}
          onPlayAgain={resetGame}
          onViewScores={navigateToScoresTab}
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
          <Tabs value={tabParam || "game"} onValueChange={(value) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", value);
            router.push(`/vocabulary?${params.toString()}`, { scroll: false });
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="game" ref={gameTabRef}>{t('game')}</TabsTrigger>
              <TabsTrigger value="scores" ref={scoresTabRef}>{t('yourScores')}</TabsTrigger>
              <TabsTrigger value="leaderboard" ref={leaderboardTabRef}>{t('leaderboard')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="game" className="mt-0">
              {!gameCompleted && vocabulary.length > 0 && (
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
              <ScoresTab 
                scores={scores}
                formatDate={formatDate}
                userId={user?.uid}
              />
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-0">
              <LeaderboardTab 
                leaderboard={leaderboard}
                userId={user?.uid}
                formatDate={formatDate}
                navigateToGameTab={navigateToGameTab}
              />
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
      
      {/* Mobile sidebar - Show as accordion at the bottom on mobile */}
      <div className="md:hidden mt-6 border-t pt-4">
        <Accordion type="multiple" defaultValue={["guide"]}>
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
  );
} 