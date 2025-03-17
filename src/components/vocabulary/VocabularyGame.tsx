import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';
import { Vocabulary } from "./types";
import { WordQuestion } from "./WordQuestion";
import { WordAnswer } from "./WordAnswer";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Trophy, Flame } from "lucide-react";

interface VocabularyGameProps {
  vocabulary: Vocabulary[];
  loading: boolean;
  difficulty: string;
  setDifficulty: (value: string) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  fetchVocabulary: () => Promise<void>;
  correctWords: string[];
  incorrectWords: string[];
  score: number;
  setCorrectWords: (words: string[]) => void;
  setIncorrectWords: (words: string[]) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setGameCompleted: (completed: boolean) => void;
}

export function VocabularyGame({
  vocabulary,
  loading,
  difficulty,
  setDifficulty,
  wordCount,
  setWordCount,
  fetchVocabulary,
  correctWords,
  incorrectWords,
  score,
  setCorrectWords,
  setIncorrectWords,
  setScore,
  setGameCompleted
}: VocabularyGameProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [showDefinitionTranslation, setShowDefinitionTranslation] = useState(false);
  const [showExampleTranslation, setShowExampleTranslation] = useState(false);
  const [definitionTranslation, setDefinitionTranslation] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  
  // Refs
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    incorrectSoundRef.current = new Audio('/sounds/incorrect.mp3');
  }, []);

  // Reset translations when moving to a new word
  useEffect(() => {
    setDefinitionTranslation("");
    setExampleTranslation("");
    setShowDefinitionTranslation(false);
    setShowExampleTranslation(false);
  }, [currentIndex]);

  const currentWord = vocabulary[currentIndex];

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling if user is typing in an input field
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (showAnswer) {
            nextWord();
          } else {
            checkAnswer();
          }
        }
        return;
      }

      // Global shortcuts
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (answerInputRef.current) {
            answerInputRef.current.focus();
          }
          break;
        case 'p':
          e.preventDefault();
          if (currentWord?.audioUrl) {
            playAudio(currentWord.audioUrl);
          } else if (currentWord) {
            generateSpeech(currentWord.word, currentWord.id);
          }
          break;
        case 'h':
          e.preventDefault();
          setShowHint(!showHint);
          break;
        case 'enter':
          e.preventDefault();
          if (showAnswer) {
            nextWord();
          } else {
            checkAnswer();
          }
          break;
        case 't':
          e.preventDefault();
          if (!showDefinitionTranslation && !definitionTranslation) {
            generateTranslation(currentWord.definition, 'definition');
          }
          setShowDefinitionTranslation(!showDefinitionTranslation);
          break;
        case 'e':
          e.preventDefault();
          if (!showExampleTranslation && !exampleTranslation) {
            generateTranslation(currentWord.example, 'example');
          }
          setShowExampleTranslation(!showExampleTranslation);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, showHint, currentWord, showDefinitionTranslation, showExampleTranslation, definitionTranslation, exampleTranslation]);

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
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
        playAudio(data.audioUrl);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      toast({
        title: t('pronunciation'),
        description: t('generatingPronunciation'),
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
  };

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
      console.log("Translation API response:", data);
      
      if (data.translatedText) {
        if (type === 'definition') {
          setDefinitionTranslation(data.translatedText);
          setShowDefinitionTranslation(true);
        } else {
          setExampleTranslation(data.translatedText);
          setShowExampleTranslation(true);
        }
      } else {
        console.error("No translatedText in response:", data);
        toast({
          title: t('error'),
          description: t('errorMessage'),
          variant: "destructive",
          className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
        });
      }
    } catch (error) {
      console.error("Error generating translation:", error);
      toast({
        title: t('error'),
        description: t('errorMessage'),
        variant: "destructive",
        className: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 text-red-800"
      });
    }
  };

  const checkAnswer = () => {
    if (!currentWord || !userAnswer.trim()) return;
    
    const isCorrect = userAnswer.toLowerCase() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      setCorrectWords([...correctWords, currentWord.word]);
      setScore(score + 10);
      setAnswerStatus('correct');
      setStreak(streak + 1);
      
      // Add bonus points for streaks
      if (streak + 1 >= 3) {
        const bonus = Math.floor((streak + 1) / 3) * 5;
        setScore((prevScore: number) => prevScore + bonus);
        toast({
          title: t('streakBonusMessage').replace('{streak}', `${streak + 1}`),
          description: t('streakBonusPointsMessage').replace('{points}', `${bonus}`),
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
        title: t('correctMessage'),
        description: t('correctPointsMessage'),
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
        title: t('incorrectMessage'),
        description: t('correctAnswerMessage').replace('{word}', currentWord.word),
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
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

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

  if (!currentWord) return null;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/20 px-3 py-1.5 rounded-full shadow-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">{currentIndex + 1}</span>
              <span className="text-muted-foreground">/</span>
              <span>{vocabulary.length}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/20 px-3 py-1.5 rounded-full shadow-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{score}</span>
            </div>
          </div>
          
          {streak >= 3 && (
            <Badge variant="secondary" className="animate-pulse flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>{streak}</span>
            </Badge>
          )}
        </div>
        <Progress 
          value={(currentIndex / vocabulary.length) * 100} 
          className="mt-2 h-1.5 bg-primary/10"
        />
      </CardHeader>
      <CardContent>
        {showAnswer ? (
          <WordAnswer 
            currentWord={currentWord}
            answerStatus={answerStatus}
            nextWord={nextWord}
            playAudio={playAudio}
            generateSpeech={generateSpeech}
            formatExample={formatExample}
            isLastWord={currentIndex === vocabulary.length - 1}
          />
        ) : (
          <WordQuestion 
            currentWord={currentWord}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            checkAnswer={checkAnswer}
            showHint={showHint}
            toggleHint={toggleHint}
            answerStatus={answerStatus}
            showDefinitionTranslation={showDefinitionTranslation}
            showExampleTranslation={showExampleTranslation}
            definitionTranslation={definitionTranslation}
            exampleTranslation={exampleTranslation}
            setShowDefinitionTranslation={setShowDefinitionTranslation}
            setShowExampleTranslation={setShowExampleTranslation}
            generateTranslation={generateTranslation}
            generateSpeech={generateSpeech}
            playAudio={playAudio}
            formatExample={formatExample}
            answerInputRef={answerInputRef}
          />
        )}
      </CardContent>
    </Card>
  );
} 