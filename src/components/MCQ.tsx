"use client";
import React, { useRef } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import { differenceInSeconds } from "date-fns";
import Link from "next/link";
import { BarChart, ChevronRight, Loader2, Timer, CheckCircle, XCircle } from "lucide-react";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import { cn, formatTimeDelta } from "@/lib/utils";
import MCQCounter from "./MCQCounter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

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
  game: Game;
};

const MCQ = ({ game }: Props) => {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [stats, setStats] = React.useState({
    correct_answers: 0,
    wrong_answers: 0,
  });
  const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(new Date());
  const [timeStarted, setTimeStarted] = React.useState(new Date());
  const [questionResults, setQuestionResults] = React.useState<boolean[]>([]);
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);
  // Store randomized options for each question
  const [randomizedOptionsMap, setRandomizedOptionsMap] = React.useState<Map<string, string[]>>(new Map());
  
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestion = React.useMemo(() => {
    return game.questionsv2[questionIndex];
  }, [questionIndex, game.questionsv2]);

  // Get randomized options for the current question
  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];

    // Check if we already have randomized options for this question
    if (randomizedOptionsMap.has(currentQuestion.id)) {
      return randomizedOptionsMap.get(currentQuestion.id) || [];
    }

    // Parse and randomize options
    const parsedOptions = JSON.parse(currentQuestion.options as string) as string[];
    const shuffledOptions = [...parsedOptions].sort(() => Math.random() - 0.5);
    
    // Store the randomized options for this question
    setRandomizedOptionsMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, shuffledOptions);
      return newMap;
    });
    
    return shuffledOptions;
  }, [currentQuestion, randomizedOptionsMap]);

  const { toast } = useToast();
  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      if (selectedChoice === null) {
        throw new Error("No option selected");
      }
      
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userInput: options[selectedChoice],
      };
      const response = await apiClient.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
        timeStarted: timeStarted.toString(),
        ...(game.submissionId && { submissionId: game.submissionId }),
      };
      const response = await apiClient.post(`/api/endGame`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
      }
    },
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    incorrectSoundRef.current = new Audio('/sounds/incorrect.mp3');
  }, []);

  const playSound = (isCorrect: boolean) => {
    if (isCorrect && correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
    } else if (!isCorrect && incorrectSoundRef.current) {
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
    }
  };

  // Reset selected choice when moving to next question
  React.useEffect(() => {
    setSelectedChoice(null);
  }, [questionIndex]);

  const handleNext = React.useCallback(() => {
    // Prevent proceeding if no option is selected
    if (selectedChoice === null) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding",
        variant: "destructive",
      });
      return;
    }

    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        // Play sound based on answer correctness
        playSound(isCorrect);
        
        // Update question results for progress map
        setQuestionResults(prev => [...prev, isCorrect]);
        
        if (isCorrect) {
          setStats((stats) => ({
            ...stats,
            correct_answers: stats.correct_answers + 1,
          }));
          toast({
            title: "Correct",
            description: "You got it right!",
            variant: "success",
          });
        } else {
          setStats((stats) => ({
            ...stats,
            wrong_answers: stats.wrong_answers + 1,
          }));
          toast({
            title: "Incorrect",
            description: "You got it wrong!",
            variant: "destructive",
          });
        }
        if (questionIndex === game.questionsv2.length - 1) {
          // Call endGame and then redirect to statistics page
          endGame(undefined, {
            onSuccess: (data) => {
              if (data.submissionId) {
                // Navigate to statistics page after a short delay to allow the user to see the toast
                setTimeout(() => {
                  router.push(`/statistics/${game.id}`);
                }, 1500);
              }
            },
          });
          return;
        }
        
        // Move to next question (selected choice will be reset by the useEffect)
        setQuestionIndex((questionIndex) => questionIndex + 1);
      },
    });
  }, [checkAnswer, questionIndex, game.questionsv2.length, toast, endGame, game.id, router, selectedChoice]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "1") {
        setSelectedChoice(0);
      } else if (key === "2") {
        setSelectedChoice(1);
      } else if (key === "3") {
        setSelectedChoice(2);
      } else if (key === "4") {
        setSelectedChoice(3);
      } else if (key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  return (
    <>
      <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex flex-col">
            {/* topic */}
            <p>
              <span className="text-slate-400">Topic</span> &nbsp;
              <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
                {game.topic}
              </span>
            </p>
            <div className="flex self-start mt-3 text-slate-400">
              <Timer className="mr-2" />
              {formatTimeDelta(differenceInSeconds(now, timeStarted))}
            </div>
          </div>
          <MCQCounter
            correct_answers={stats.correct_answers}
            wrong_answers={stats.wrong_answers}
          />
        </div>
        
        {/* Progress Map */}
        <div className="flex flex-wrap items-center justify-center w-full mt-4 mb-2 gap-1">
          {game.questionsv2.map((_, idx) => {
            // Current question
            if (idx === questionIndex) {
              return (
                <div 
                  key={idx} 
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold"
                >
                  {idx + 1}
                </div>
              );
            }
            // Answered questions
            if (idx < questionResults.length) {
              return questionResults[idx] ? (
                <div 
                  key={idx} 
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
              ) : (
                <div 
                  key={idx} 
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <XCircle className="w-4 h-4" />
                </div>
              );
            }
            // Unanswered questions
            return (
              <div 
                key={idx} 
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 text-xs font-bold"
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        
        <Card className="w-full mt-4">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
              <div>{questionIndex + 1}</div>
              <div className="text-base text-slate-400">
                {game.questionsv2.length}
              </div>
            </CardTitle>
            <CardDescription className="flex-grow text-lg break-words">
              {currentQuestion?.question}
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-col items-center justify-center w-full mt-4">
          {options.map((option, index) => {
            return (
              <Button
                key={option}
                variant={selectedChoice === index ? "default" : "outline"}
                className="justify-start w-full py-4 mb-4"
                onClick={() => setSelectedChoice(index)}
              >
                <div className="flex items-center justify-start">
                  <div className="p-2 px-3 mr-5 border rounded-md">
                    {index + 1}
                  </div>
                  <div className="text-start break-words">{option}</div>
                </div>
              </Button>
            );
          })}
          <Button
            variant="default"
            className="mt-2"
            size="lg"
            disabled={isChecking || selectedChoice === null}
            onClick={() => {
              handleNext();
            }}
          >
            {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default MCQ;
