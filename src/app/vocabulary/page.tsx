"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Volume, RefreshCw, BookOpen, Lightbulb, Info, HelpCircle, Keyboard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Loader2, 
  Volume2, 
  X 
} from "lucide-react";

interface Vocabulary {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
  vietnameseTranslation: string;
  difficulty: string;
  audioUrl: string | null;
  synonyms?: string[];
  antonyms?: string[];
  usageNotes?: string;
  partOfSpeech?: string;
}

interface Score {
  id: string;
  userId: string;
  score: number;
  wordsCorrect: string[];
  wordsIncorrect: string[];
  createdAt: Date | null;
}

export default function VocabularyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [wordCount, setWordCount] = useState<number>(5);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  
  // Audio references
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Track answer status for visual feedback
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  
  // Add state for showing translations
  const [showDefinitionTranslation, setShowDefinitionTranslation] = useState(false);
  const [showExampleTranslation, setShowExampleTranslation] = useState(false);
  
  // Add state for Vietnamese translations
  const [definitionTranslation, setDefinitionTranslation] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  
  // Add a ref for the input field
  const answerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize audio elements
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    incorrectSoundRef.current = new Audio('/sounds/incorrect.mp3');
    
    // Don't auto-fetch vocabulary - user needs to click the generate button
    // fetchVocabulary();
    
    if (user) {
      fetchScores();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      
      // Build the query parameters
      const params = new URLSearchParams();
      if (difficulty && difficulty !== "all") {
        params.append("difficulty", difficulty);
      }
      params.append("count", wordCount.toString());
      
      const response = await fetch(`/api/vocabulary/generate?${params.toString()}`);
      const data = await response.json();
      
      if (data.vocabulary) {
        setVocabulary(data.vocabulary);
        
        // Generate speech for each word
        for (const word of data.vocabulary) {
          if (!word.audioUrl) {
            generateSpeech(word.word, word.id);
          }
        }
        
        // Reset game state
        setCurrentIndex(0);
        setUserAnswer("");
        setShowAnswer(false);
        setCorrectWords([]);
        setIncorrectWords([]);
        setScore(0);
        setGameCompleted(false);
        setShowHint(false);
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
    try {
      const response = await fetch(`/api/vocabulary/score?userId=${user?.uid}`);
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

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const checkAnswer = () => {
    const currentWord = vocabulary[currentIndex];
    const isCorrect = userAnswer.toLowerCase() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      setCorrectWords([...correctWords, currentWord.word]);
      setScore(score + 10);
      setAnswerStatus('correct');
      setStreak(streak + 1);
      
      // Add bonus points for streaks
      if (streak + 1 >= 3) {
        const bonus = Math.floor((streak + 1) / 3) * 5;
        setScore(score => score + bonus);
        toast({
          title: `${streak + 1} Streak Bonus! 🔥`,
          description: `You earned an extra ${bonus} points!`,
          variant: "default",
          className: "bg-amber-50 border-amber-200 dark:bg-amber-900 dark:border-amber-800 dark:text-amber-100"
        });
      }
      
      // Play correct sound
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
      }
      
      // Trigger confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: "Correct! 🎉",
        description: `Great job! You earned 10 points.`,
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800 dark:text-green-100"
      });
    } else {
      setIncorrectWords([...incorrectWords, currentWord.word]);
      setAnswerStatus('incorrect');
      setStreak(0); // Reset streak on incorrect answer
      
      // Play incorrect sound
      if (incorrectSoundRef.current) {
        incorrectSoundRef.current.currentTime = 0;
        incorrectSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
      }
      
      toast({
        title: "Incorrect! 😕",
        description: `The correct answer is: ${currentWord.word}`,
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
    
    setShowAnswer(true);
  };

  const nextWord = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
      setShowHint(false);
      setAnswerStatus(null);
    } else {
      // Game completed
      setGameCompleted(true);
      saveScore();
    }
  };

  // Handle keyboard shortcuts including space for focus
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip if user is typing in an input field
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (e.key === 'Enter') {
      if (showAnswer) {
        nextWord();
      } else {
        checkAnswer();
      }
    } else if (e.key === 'p' || e.key === 'P') {
      // Play pronunciation when 'P' key is pressed
      if (vocabulary.length > 0 && currentWord) {
        if (currentWord.audioUrl) {
          playAudio(currentWord.audioUrl);
        } else {
          // If audio URL is not available, generate speech
          generateSpeech(currentWord.word, currentWord.id);
          toast({
            title: "Generating pronunciation",
            description: "Audio is being prepared, please try again in a moment",
            variant: "default",
            className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          });
        }
      }
    } else if (e.key === 'h' || e.key === 'H') {
      // Toggle hint when 'H' key is pressed
      setShowHint(!showHint);
    } else if (e.key === ' ' && !showAnswer && vocabulary.length > 0) {
      // Focus the input field when space key is pressed
      e.preventDefault(); // Prevent space from being added to the input
      if (answerInputRef.current) {
        answerInputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAnswer, showHint, vocabulary, currentIndex]);

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

  const resetGame = () => {
    fetchVocabulary();
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const currentWord = vocabulary[currentIndex];

  // Modify the formatExample function to return a React element instead of HTML string
  const formatExample = (example: string, word: string) => {
    if (showAnswer) {
      // Replace blank spaces or underscores with the word
      const parts = example.split(/___+|\.\.\.+|\(\.\.\.\)|\[\.\.\.]/g);
      if (parts.length === 1) return example; // No blanks found
      
      return (
        <>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && <strong>{word}</strong>}
            </React.Fragment>
          ))}
        </>
      );
    }
    return example;
  };

  // Add a function to generate Vietnamese translations
  const generateTranslation = async (text: string, type: 'definition' | 'example') => {
    try {
      // Call the translation API
      const response = await fetch("/api/vocabulary/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (data.translatedText) {
        if (type === 'definition') {
          setDefinitionTranslation(data.translatedText);
        } else {
          setExampleTranslation(data.translatedText);
        }
      }
    } catch (error) {
      console.error(`Error generating ${type} translation:`, error);
      toast({
        title: "Translation Error",
        description: `Could not translate the ${type}`,
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
  };

  // Update the useEffect to reset translations when moving to a new word
  useEffect(() => {
    // Reset translations when moving to a new word
    setDefinitionTranslation("");
    setExampleTranslation("");
    setShowDefinitionTranslation(false);
    setShowExampleTranslation(false);
  }, [currentIndex]);

  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | null): string => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="container max-w-6xl py-2 sm:py-4 md:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Vocabulary Practice</h1>
      
      {/* Audio elements for sound effects */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
      
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div>
          <Tabs defaultValue="game" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="scores">Your Scores</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="game">
              {!gameCompleted && vocabulary.length > 0 && (
                <div className="mb-4 bg-muted/30 rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Word Count</label>
                    <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="5 Words" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Words</SelectItem>
                        <SelectItem value="10">10 Words</SelectItem>
                        <SelectItem value="15">15 Words</SelectItem>
                        <SelectItem value="20">20 Words</SelectItem>
                        <SelectItem value="30">30 Words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={fetchVocabulary} 
                    className="flex-1 sm:flex-initial mt-2 sm:mt-0" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Words
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : gameCompleted ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                      Game Completed!
                    </CardTitle>
                    <CardDescription>Your final score: {score} points</CardDescription>
                    <Progress 
                      value={100} 
                      className="h-2 mt-2" 
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-3 rounded-md">
                        <h3 className="font-medium mb-2 text-sm sm:text-base">Performance Summary</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                            <p className="text-lg sm:text-xl font-bold">
                              {vocabulary.length > 0 
                                ? Math.round((correctWords.length / vocabulary.length) * 100) 
                                : 0}%
                            </p>
                          </div>
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-lg sm:text-xl font-bold">{score}</p>
                          </div>
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Words</p>
                            <p className="text-lg sm:text-xl font-bold">{vocabulary.length}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-1 text-green-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Correct ({correctWords.length})
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-md min-h-[80px]">
                            {correctWords.length > 0 ? (
                              correctWords.map((word) => (
                                <Badge key={word} variant="outline" className="bg-green-100 dark:bg-green-900/40 text-xs">{word}</Badge>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No correct words</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-1 text-red-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Incorrect ({incorrectWords.length})
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-md min-h-[80px]">
                            {incorrectWords.length > 0 ? (
                              incorrectWords.map((word) => (
                                <Badge key={word} variant="outline" className="bg-red-100 dark:bg-red-900/40 text-xs">{word}</Badge>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No incorrect words</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Button onClick={() => fetchVocabulary()} className="gap-2" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                        New Words
                      </Button>
                      <Button onClick={resetGame} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Play Again
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : vocabulary.length > 0 && currentWord ? (
                <Card>
                  <CardHeader className="pb-2 sm:pb-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center text-base sm:text-lg">
                          Word {currentIndex + 1} of {vocabulary.length}
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {Math.round(((currentIndex + 1) / vocabulary.length) * 100)}%
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Score: {score} points
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={
                          currentWord.difficulty === "beginner" ? "default" :
                          currentWord.difficulty === "intermediate" ? "secondary" : "destructive"
                        } className="capitalize">
                          {currentWord.difficulty}
                        </Badge>
                        {streak > 0 && (
                          <div className="flex items-center bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                            <span className="text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                              {streak} Streak
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={((currentIndex + 1) / vocabulary.length) * 100} 
                      className="h-1.5 mt-2" 
                    />
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {showAnswer ? (
                      // Answer display - simplified for mobile
                      <div className={cn(
                        "p-3 sm:p-4 rounded-md transition-all",
                        answerStatus === 'correct' ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" : 
                        "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      )}>
                        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                          {answerStatus === 'correct' ? (
                            <div className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-1.5 sm:p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-1.5 sm:p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-base sm:text-lg">
                              {answerStatus === 'correct' ? "Correct!" : "Incorrect"}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {answerStatus === 'correct' 
                                ? "Great job! You earned 10 points." 
                                : `The correct answer is: ${currentWord.word}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2 sm:gap-3 mt-3 sm:mt-4">
                          <div className="bg-background/80 p-2 sm:p-3 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">Word:</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  if (currentWord.audioUrl) {
                                    playAudio(currentWord.audioUrl);
                                  } else {
                                    // If audio URL is not available, generate speech
                                    generateSpeech(currentWord.word, currentWord.id);
                                    toast({
                                      title: "Generating pronunciation",
                                      description: "Audio is being prepared, please try again in a moment",
                                      variant: "default"
                                    });
                                  }
                                }}
                              >
                                <Volume className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-lg font-bold">{currentWord.word}</p>
                            <p className="text-sm text-muted-foreground">{currentWord.pronunciation}</p>
                          </div>
                          
                          <div className="bg-background/80 p-2 sm:p-3 rounded-md">
                            <span className="font-medium">Definition:</span>
                            <p className="mt-1">{currentWord.definition}</p>
                            {currentWord.vietnameseTranslation && (
                              <p className="mt-1 text-sm italic text-muted-foreground">{currentWord.vietnameseTranslation}</p>
                            )}
                          </div>
                          
                          <div className="bg-background/80 p-2 sm:p-3 rounded-md">
                            <span className="font-medium">Example:</span>
                            <p className="mt-1">
                              {typeof formatExample(currentWord.example, currentWord.word) === 'string' 
                                ? formatExample(currentWord.example, currentWord.word) as string
                                : formatExample(currentWord.example, currentWord.word)}
                            </p>
                          </div>
                        </div>
                        
                        <Button onClick={nextWord} className="w-full mt-3 sm:mt-4 gap-1">
                          {currentIndex < vocabulary.length - 1 ? "Next Word" : "Finish Game"}
                          <kbd className="ml-1 px-1 py-0.5 text-xs border rounded-md">Enter</kbd>
                        </Button>
                      </div>
                    ) : (
                      // Question display - simplified for mobile
                      <>
                        <div className="grid gap-3">
                          <div>
                            <div className="flex justify-between items-center mb-1 sm:mb-2">
                              <h3 className="font-medium text-sm sm:text-base">
                                Definition
                                {currentWord.vietnameseTranslation && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({currentWord.vietnameseTranslation.split(' ').slice(0, 3).join(' ')}...)
                                  </span>
                                )}
                              </h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (!showDefinitionTranslation && !definitionTranslation) {
                                    generateTranslation(currentWord.definition, 'definition');
                                  }
                                  setShowDefinitionTranslation(!showDefinitionTranslation);
                                }}
                                className="text-xs h-6 sm:h-7 px-2 text-muted-foreground hover:text-foreground"
                              >
                                {showDefinitionTranslation ? "Hide 🇻🇳" : "Show 🇻🇳"}
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                              <p className="text-sm sm:text-base">{currentWord.definition}</p>
                              {showDefinitionTranslation && (
                                <div className="mt-2 p-2 bg-background/50 rounded-md">
                                  <p className="text-sm italic text-muted-foreground">
                                    {definitionTranslation || currentWord.vietnameseTranslation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1 sm:mb-2">
                              <h3 className="font-medium text-sm sm:text-base">Example</h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (!showExampleTranslation && !exampleTranslation) {
                                    generateTranslation(currentWord.example, 'example');
                                  }
                                  setShowExampleTranslation(!showExampleTranslation);
                                }}
                                className="text-xs h-6 sm:h-7 px-2 text-muted-foreground hover:text-foreground"
                              >
                                {showExampleTranslation ? "Hide 🇻🇳" : "Show 🇻🇳"}
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                              <p className="text-sm sm:text-base">
                                {typeof formatExample(currentWord.example, currentWord.word) === 'string' 
                                  ? formatExample(currentWord.example, currentWord.word) as string
                                  : formatExample(currentWord.example, currentWord.word)}
                              </p>
                              {showExampleTranslation && (
                                <div className="mt-2 p-2 bg-background/50 rounded-md">
                                  <p className="text-sm italic text-muted-foreground">
                                    {exampleTranslation || `Ví dụ: ${currentWord.vietnameseTranslation.split(' ').slice(0, 5).join(' ')}...`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1 sm:mb-2">
                              <h3 className="font-medium text-sm sm:text-base">Pronunciation</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (currentWord.audioUrl) {
                                    playAudio(currentWord.audioUrl);
                                  } else {
                                    // If audio URL is not available, generate speech
                                    generateSpeech(currentWord.word, currentWord.id);
                                    toast({
                                      title: "Generating pronunciation",
                                      description: "Audio is being prepared, please try again in a moment",
                                      variant: "default",
                                      className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                    });
                                  }
                                }}
                                className="h-6 sm:h-8 gap-1"
                              >
                                <Volume className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only sm:not-sr-only">Play</span>
                                <kbd className="ml-1 hidden sm:inline-flex px-1 py-0.5 text-xs border rounded-md">P</kbd>
                              </Button>
                            </div>
                            <div className="bg-muted/30 p-2 sm:p-3 rounded-md">
                              <p className="text-sm sm:text-base">{currentWord.pronunciation}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative mt-2">
                          <Input
                            ref={answerInputRef}
                            type="text"
                            placeholder="Type your answer... (press Space to focus)"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className={cn(
                              "w-full pr-10 text-base sm:text-lg font-medium",
                              answerStatus === 'correct' && "border-green-500 ring-1 ring-green-500",
                              answerStatus === 'incorrect' && "border-red-500 ring-1 ring-red-500"
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !showAnswer) {
                                checkAnswer();
                              }
                            }}
                          />
                          {userAnswer && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              onClick={() => setUserAnswer("")}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              <span className="sr-only">Clear</span>
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 relative">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1 h-8"
                                    onClick={toggleHint}
                                  >
                                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="sr-only sm:not-sr-only">Hint</span>
                                    <kbd className="ml-1 hidden sm:inline-flex px-1 py-0.5 text-xs border rounded-md">H</kbd>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Press H key to show hint</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {/* Show hint directly instead of using Popover */}
                            {showHint && (
                              <div className="absolute top-full left-0 mt-2 p-3 bg-background border rounded-lg shadow-md z-10 w-72">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium">Hint</h4>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm">First letter: {currentWord.word[0].toUpperCase()}</p>
                                    <p className="text-sm">Number of letters: {currentWord.word.length}</p>
                                    {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                                      <p className="text-sm">Synonym: {currentWord.synonyms[0]}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {currentWord.partOfSpeech && (
                              <Badge variant="outline" className="text-xs">{currentWord.partOfSpeech}</Badge>
                            )}
                          </div>
                          
                          <Button 
                            onClick={checkAnswer}
                            className="gap-1"
                            disabled={!userAnswer.trim()}
                          >
                            Check <span className="sr-only sm:not-sr-only">Answer</span>
                            <kbd className="ml-1 px-1 py-0.5 text-xs border rounded-md">Enter</kbd>
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Vocabulary Practice</CardTitle>
                    <CardDescription>Learn English words with Vietnamese translations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Difficulty Level</label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Words</label>
                        <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Words</SelectItem>
                            <SelectItem value="10">10 Words</SelectItem>
                            <SelectItem value="15">15 Words</SelectItem>
                            <SelectItem value="20">20 Words</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <BookOpen className="h-10 w-10 text-primary/80 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Ready to learn new words?</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Practice English vocabulary with Vietnamese translations
                      </p>
                      <Button 
                        onClick={fetchVocabulary} 
                        className="w-full max-w-xs" 
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Start Learning
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="scores">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path><path d="M12 20c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"></path><path d="M20 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"></path><path d="M4 12c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"></path><path d="M16.5 7.5 12 12"></path><path d="m7.5 16.5 4.5-4.5"></path><path d="m16.5 16.5-4.5-4.5"></path><path d="m7.5 7.5 4.5 4.5"></path></svg>
                    Your Scores
                  </CardTitle>
                  <CardDescription>Your recent vocabulary game performance history</CardDescription>
                </CardHeader>
                <CardContent>
                  {scores.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary stats */}
                      <div className="bg-muted/30 p-3 rounded-md mb-4">
                        <h3 className="font-medium mb-2 text-sm">Performance Summary</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Games</p>
                            <p className="text-lg font-bold">{scores.length}</p>
                          </div>
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Best Score</p>
                            <p className="text-lg font-bold">
                              {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
                            </p>
                          </div>
                          <div className="bg-background p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Avg. Score</p>
                            <p className="text-lg font-bold">
                              {scores.length > 0 
                                ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) 
                                : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score list */}
                      <h3 className="font-medium text-sm mb-2">Recent Games</h3>
                      <div className="space-y-3">
                        {scores.slice(0, 5).map((score, index) => (
                          <div key={score.id} className="border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <h3 className="font-medium">{score.score} points</h3>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {score.createdAt ? formatDate(new Date(score.createdAt)) : "Unknown date"}
                              </p>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  Correct: {score.wordsCorrect.length}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {score.wordsCorrect.slice(0, 3).map((word) => (
                                    <Badge key={word} variant="outline" className="bg-green-100 dark:bg-green-900/40 text-xs">{word}</Badge>
                                  ))}
                                  {score.wordsCorrect.length > 3 && (
                                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/40 text-xs">+{score.wordsCorrect.length - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  Incorrect: {score.wordsIncorrect.length}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {score.wordsIncorrect.slice(0, 3).map((word) => (
                                    <Badge key={word} variant="outline" className="bg-red-100 dark:bg-red-900/40 text-xs">{word}</Badge>
                                  ))}
                                  {score.wordsIncorrect.length > 3 && (
                                    <Badge variant="outline" className="bg-red-100 dark:bg-red-900/40 text-xs">+{score.wordsIncorrect.length - 3} more</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                Accuracy: {Math.round((score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100)}%
                              </p>
                              <Progress 
                                value={Math.round((score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100)} 
                                className="h-1 mt-1" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No scores yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Play a game to see your scores here</p>
                      <Button 
                        onClick={() => {
                          const gameTab = document.querySelector('[data-value="game"]');
                          if (gameTab instanceof HTMLElement) {
                            gameTab.click();
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Start a Game
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                    Leaderboard
                  </CardTitle>
                  <CardDescription>Top scores from all players</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {/* Top 3 podium */}
                      <div className="flex justify-center items-end h-32 mb-6 mt-2">
                        {leaderboard.length > 1 && (
                          <div className="flex flex-col items-center mx-2">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-2">
                              <span className="text-lg font-bold">2</span>
                            </div>
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-t-md flex items-center justify-center">
                              <div className="text-center">
                                <p className="font-bold text-lg">{leaderboard[1].score}</p>
                                <p className="text-xs text-muted-foreground">
                                  {leaderboard[1].userId === user?.uid ? "You" : `Player ${leaderboard[1].userId.substring(0, 3)}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {leaderboard.length > 0 && (
                          <div className="flex flex-col items-center mx-2 -mt-8">
                            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center overflow-hidden mb-2 relative">
                              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">1</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -top-1 -right-1 text-amber-500"><polygon points="12 2, 15.09 8.26, 22 9.27, 17 14.14, 18.18 21.02, 12 17.77, 5.82 21.02, 7 14.14, 2 9.27, 8.91 8.26"></polygon></svg>
                            </div>
                            <div className="w-24 h-28 bg-amber-100 dark:bg-amber-900/30 rounded-t-md flex items-center justify-center">
                              <div className="text-center">
                                <p className="font-bold text-xl">{leaderboard[0].score}</p>
                                <p className="text-xs text-muted-foreground">
                                  {leaderboard[0].userId === user?.uid ? "You" : `Player ${leaderboard[0].userId.substring(0, 3)}`}
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  {leaderboard[0].wordsCorrect.length} correct
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {leaderboard.length > 2 && (
                          <div className="flex flex-col items-center mx-2">
                            <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center overflow-hidden mb-2">
                              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">3</span>
                            </div>
                            <div className="w-18 h-16 bg-orange-100/50 dark:bg-orange-900/20 rounded-t-md flex items-center justify-center">
                              <div className="text-center">
                                <p className="font-bold text-lg">{leaderboard[2].score}</p>
                                <p className="text-xs text-muted-foreground">
                                  {leaderboard[2].userId === user?.uid ? "You" : `Player ${leaderboard[2].userId.substring(0, 3)}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Other rankings */}
                      <h3 className="font-medium text-sm mb-2">All Rankings</h3>
                      <div className="space-y-1">
                        {leaderboard.map((score, index) => (
                          <div 
                            key={score.id} 
                            className={cn(
                              "flex items-center p-2 rounded-md",
                              score.userId === user?.uid ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/10",
                              index < 3 ? "hidden sm:flex" : "flex"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium",
                              index === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                              index === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                              index === 2 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" :
                              "bg-primary/10 text-primary"
                            )}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="font-medium text-sm">
                                  {score.userId === user?.uid ? "You" : `Player ${score.userId.substring(0, 6)}`}
                                </p>
                                {score.userId === user?.uid && (
                                  <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-4">You</Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span className="mr-2">{score.wordsCorrect.length} correct</span>
                                <span>{score.wordsIncorrect.length} incorrect</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{score.score}</p>
                              <p className="text-xs text-muted-foreground">
                                {score.createdAt ? formatDate(new Date(score.createdAt)) : "Unknown date"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/50"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                      <p className="text-muted-foreground mb-2">No leaderboard data yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Be the first to play and set a high score!</p>
                      <Button 
                        onClick={() => {
                          const gameTab = document.querySelector('[data-value="game"]');
                          if (gameTab instanceof HTMLElement) {
                            gameTab.click();
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Start a Game
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-0">
          <Card className="sm:sticky sm:top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                <span>Quick Guide</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Keyboard Shortcuts</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs">Enter</kbd>
                            <span>Submit answer or continue</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs">P</kbd>
                            <span>Play word pronunciation</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs">H</kbd>
                            <span>Show word hint</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">1</span>
                  <span>Generate vocabulary words</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">2</span>
                  <span>Read definition and guess the word</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">3</span>
                  <span>Use translations and hints if needed</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">4</span>
                  <span>Check your answer and learn</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Add a new card for learning tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Learning Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-muted/30 rounded-md">
                  <h4 className="font-medium mb-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Spaced Repetition
                  </h4>
                  <p className="text-muted-foreground text-xs">Review words at increasing intervals to improve long-term retention.</p>
                </div>
                
                <div className="p-2 bg-muted/30 rounded-md">
                  <h4 className="font-medium mb-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Context Learning
                  </h4>
                  <p className="text-muted-foreground text-xs">Learn words in context through example sentences for better understanding.</p>
                </div>
                
                <div className="p-2 bg-muted/30 rounded-md">
                  <h4 className="font-medium mb-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Active Recall
                  </h4>
                  <p className="text-muted-foreground text-xs">Test yourself regularly to strengthen memory connections.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add a progress tracker if user is logged in and has scores */}
          {user && scores.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Words Learned</span>
                    <span className="font-bold">
                      {scores.reduce((sum, s) => sum + s.wordsCorrect.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Average Accuracy</span>
                    <span className="font-bold">
                      {Math.round(
                        (scores.reduce((sum, s) => sum + s.wordsCorrect.length, 0) / 
                        (scores.reduce((sum, s) => sum + s.wordsCorrect.length + s.wordsIncorrect.length, 0) || 1)) * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Best Score</span>
                    <span className="font-bold">
                      {scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Learning Progress</p>
                    <Progress 
                      value={Math.min(
                        (scores.reduce((sum, s) => sum + s.wordsCorrect.length, 0) / 100) * 100, 
                        100
                      )} 
                      className="h-2" 
                    />
                    <p className="text-xs text-right mt-1 text-muted-foreground">
                      {scores.reduce((sum, s) => sum + s.wordsCorrect.length, 0)} words
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 