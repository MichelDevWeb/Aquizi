"use client";
import { cn, formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { BarChart, ChevronRight, Loader2, Timer, CheckCircle, XCircle } from "lucide-react";
import React, { useRef } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import OpenEndedPercentage from "./OpenEndedPercentage";
import BlankAnswerInput from "./BlankAnswerInput";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import { useToast } from "./ui/use-toast";
import Link from "next/link";
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

const OpenEnded = ({ game }: Props) => {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [blankAnswer, setBlankAnswer] = React.useState("");
  const [averagePercentage, setAveragePercentage] = React.useState(0);
  const [timeStarted, setTimeStarted] = React.useState(new Date());
  const [questionResults, setQuestionResults] = React.useState<number[]>([]);
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);
  const [hasUserInput, setHasUserInput] = React.useState(false);
  
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const currentQuestion = React.useMemo(() => {
    return game.questionsv2[questionIndex];
  }, [questionIndex, game.questionsv2]);
  
  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
        timeStarted: timeStarted.toString(),
        // Pass the submissionId if this is a retest
        ...(game.submissionId && { submissionId: game.submissionId }),
      };
      const response = await apiClient.post(`/api/endGame`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Store the submission ID returned from the API
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
      }
    },
  });
  
  const { toast } = useToast();
  const [now, setNow] = React.useState(new Date());
  
  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      let filledAnswer = blankAnswer;
      document.querySelectorAll("#user-blank-input").forEach((input) => {
        filledAnswer = filledAnswer.replace(
          "_____",
          (input as HTMLInputElement).value
        );
        (input as HTMLInputElement).value = "";
      });
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userInput: filledAnswer,
      };
      const response = await apiClient.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });
  
  // Initialize audio elements when component mounts
  React.useEffect(() => {
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    incorrectSoundRef.current = new Audio('/sounds/incorrect.mp3');
  }, []);

  const playSound = (percentageSimilar: number) => {
    // Consider 70% or higher as "correct enough" to play the correct sound
    if (percentageSimilar >= 70 && correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
    } else if (percentageSimilar < 70 && incorrectSoundRef.current) {
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch(err => console.error("Error playing sound:", err));
    }
  };
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset blank answer and user input flag when moving to next question
  React.useEffect(() => {
    setBlankAnswer("");
    setHasUserInput(false);
  }, [questionIndex]);

  // Track when user provides input
  const handleBlankAnswerChange = (newAnswer: string) => {
    setBlankAnswer(newAnswer);
    
    // Check if there's any actual input in the answer fields
    const hasInput = document.querySelectorAll("#user-blank-input").length === 0 || 
      Array.from(document.querySelectorAll("#user-blank-input"))
        .some((input) => (input as HTMLInputElement).value.trim() !== "");
    
    setHasUserInput(hasInput || newAnswer.trim() !== "");
  };

  const handleNext = React.useCallback(() => {
    // Prevent proceeding if no answer is provided
    if (!hasUserInput) {
      toast({
        title: "Please provide an answer",
        description: "You must enter an answer before proceeding",
        variant: "destructive",
      });
      return;
    }

    checkAnswer(undefined, {
      onSuccess: ({ percentageSimilar }) => {
        // Play sound based on answer similarity
        playSound(percentageSimilar);
        
        // Update question results for progress map
        setQuestionResults(prev => [...prev, percentageSimilar]);
        
        setAveragePercentage((prev) => {
          const newAverage =
            (prev * questionIndex + percentageSimilar) / (questionIndex + 1);
          return newAverage;
        });
        toast({
          title: `Your answer is ${percentageSimilar}% similar to the correct answer`,
          description: `Correct answer: ${currentQuestion.answer}`,
        });
        if (questionIndex === game.questionsv2.length - 1) {
          // Call endGame and then redirect to statistics page
          endGame(undefined, {
            onSuccess: (data) => {
              if (data.submissionId) {
                // Navigate to statistics page after a short delay to allow the user to see the toast
                setTimeout(() => {
                  router.push(`/statistics/${game.id}`);
                }, 1000);
              }
            },
          });
          return;
        }
        
        // Move to next question (blank answer will be reset by the useEffect)
        setQuestionIndex((prev) => prev + 1);
      },
    });
  }, [
    checkAnswer,
    questionIndex,
    game.questionsv2.length,
    currentQuestion.answer,
    toast,
    endGame,
    game.id,
    router,
    hasUserInput,
  ]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-3 sm:px-6 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between w-full">
        <div className="flex flex-col">
          {/* topic */}
          <p>
            <span className="text-slate-400 text-sm sm:text-base">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800 text-sm sm:text-base">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-2 sm:mt-3 text-slate-400 text-sm sm:text-base">
            <Timer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {formatTimeDelta(differenceInSeconds(now, timeStarted))}
          </div>
        </div>
        <OpenEndedPercentage percentage={averagePercentage} />
      </div>
      
      {/* Progress Map */}
      <div className="flex flex-wrap items-center justify-center w-full mt-3 sm:mt-4 mb-2 gap-1">
        {game.questionsv2.map((_, idx) => {
          // Current question
          if (idx === questionIndex) {
            return (
              <div 
                key={idx} 
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold"
                title={`Question ${idx + 1} (current)`}
              >
                {idx + 1}
              </div>
            );
          }
          // Answered questions
          if (idx < questionResults.length) {
            const similarity = questionResults[idx];
            let bgColor = "bg-red-500";
            if (similarity >= 80) bgColor = "bg-green-500";
            else if (similarity >= 60) bgColor = "bg-yellow-500";
            else if (similarity >= 40) bgColor = "bg-orange-500";
            
            return (
              <div 
                key={idx} 
                className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${bgColor} text-white text-xs font-bold`}
                title={`Question ${idx + 1}: ${similarity.toFixed(0)}% similar`}
              >
                {similarity >= 70 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
              </div>
            );
          }
          // Unanswered questions
          return (
            <div 
              key={idx} 
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 text-xs font-bold"
              title={`Question ${idx + 1} (upcoming)`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
      
      <Card className="w-full mt-3 sm:mt-4">
        <CardHeader className="flex flex-row items-center p-4 sm:p-6">
          <CardTitle className="mr-4 sm:mr-5 text-center divide-y divide-zinc-600/50">
            <div className="text-base sm:text-lg">{questionIndex + 1}</div>
            <div className="text-sm sm:text-base text-slate-400">
              {game.questionsv2.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-base sm:text-lg">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col items-center justify-center w-full mt-3 sm:mt-4">
        <BlankAnswerInput
          setBlankAnswer={handleBlankAnswerChange}
          answer={currentQuestion.answer}
        />
        <Button
          variant="default"
          className="mt-2 w-full sm:w-auto"
          size="lg"
          disabled={isChecking || !hasUserInput}
          onClick={() => {
            handleNext();
          }}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      {/* Audio elements for sounds */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
      <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" />
    </div>
  );
};

export default OpenEnded;
