"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { ChevronLeft, X } from "lucide-react";
import ResultCard from "./ResultCard";
import QuizzSubmission from "./QuizzSubmission";
import { saveSubmission } from "@/app/actions/saveSubmissions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/firebase-auth";

// Define Firestore types
interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  answers: Answer[];
}

interface Quizz {
  id: string;
  name: string;
  description: string;
  userId: string;
  questions: Question[];
}

interface Props {
  quizz: Quizz;
  submissionId?: string;
  initialScore?: number;
}

export default function QuizzQuestions(props: Props) {
  const { questions } = props.quizz;
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; answerId: string }[]
  >([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionId, setSubmissionId] = useState<string | undefined>(props.submissionId);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (started && !startTime) {
      setStartTime(new Date());
    }
  }, [started, startTime]);

  const handleNext = () => {
    if (!started) {
      setStarted(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleAnswer = (answer: Answer, questionId: string) => {
    const newUserAnswersArr = [
      ...userAnswers,
      {
        questionId,
        answerId: answer.id,
      },
    ];
    setUserAnswers(newUserAnswersArr);
    const isCurrentCorrect = answer.isCorrect;
    if (isCurrentCorrect) {
      setScore(score + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const endTime = new Date();
      // Ensure we have a valid timeSpent value (default to 0 if startTime is null)
      const timeSpent = startTime 
        ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) 
        : 0;
      
      console.log("Submitting quiz with:", {
        score,
        totalQuestions: questions.length,
        timeSpent,
        startTime,
        endTime,
        quizzId: props.quizz.id,
        userId: props.quizz.userId
      });

      if (submissionId) {
        // Update existing submission
        console.log("Updating existing submission:", submissionId);
        const response = await fetch("/api/game/retest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await user?.getIdToken()}`
          },
          body: JSON.stringify({
            submissionId,
            score,
            timeSpent
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to update submission:", errorText);
          throw new Error(`Failed to update submission: ${errorText}`);
        }
        
        console.log("Submission updated successfully");
      } else {
        // Create new submission
        console.log("Creating new submission with data:", {
          score, 
          gameId: props.quizz.id,
          userId: props.quizz.userId,
          timeSpent
        });
        
        if (!props.quizz.id) {
          console.error("Missing quizz.id for submission");
          throw new Error("Missing quizz.id for submission");
        }
        
        if (!props.quizz.userId) {
          console.error("Missing quizz.userId for submission");
          throw new Error("Missing quizz.userId for submission");
        }
        
        const newSubmissionId = await saveSubmission({ 
          score, 
          gameId: props.quizz.id,
          userId: props.quizz.userId,
          timeSpent
        });
        
        console.log("New submission created with ID:", newSubmissionId);
        setSubmissionId(newSubmissionId);
      }
    } catch (e) {
      console.error("Error saving submission:", e);
    }

    setSubmitted(true);
  };

  const handlePressPrev = () => {
    if (currentQuestion !== 0) {
      setCurrentQuestion((prevCurrentQuestion) => prevCurrentQuestion - 1);
    } else {
      handleExit();
    }
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  const handleRetest = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setUserAnswers([]);
    setSubmitted(false);
    setStartTime(null);
  };

  const scorePercentage: number = Math.round((score / questions.length) * 100);
  const selectedAnswer: string | undefined = userAnswers.find(
    (item) => item.questionId === questions[currentQuestion].id
  )?.answerId;

  if (submitted) {
    return (
      <QuizzSubmission
        score={score}
        scorePercentage={scorePercentage}
        totalQuestions={questions.length}
        submissionId={submissionId}
        onRetest={handleRetest}
      />
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col flex-1">
        <div className="position-sticky top-0 z-10 shadow-md py-4 w-full">
          <header className="flex items-center justify-end py-2 gap-2">
            <Button
              onClick={handleExit}
              size="icon"
              variant="outline"
            >
              <X />
            </Button>
          </header>
        </div>
        <main className="py-11 flex flex-col gap-4 items-center flex-1 mt-24">
          <h2 className="text-3xl font-bold">{props.quizz.name}</h2>
          <p className="text-muted-foreground">{props.quizz.description}</p>
          <Button onClick={handleNext} className="mt-4">
            Start Quiz
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="position-sticky top-0 z-10 shadow-md py-4 w-full">
        <header className="flex items-center justify-between py-2">
          <Button
            onClick={handlePressPrev}
            size="icon"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={handleExit}
            size="icon"
            variant="outline"
          >
            <X />
          </Button>
        </header>
        <ProgressBar
          value={(currentQuestion + 1) / questions.length}
          className="mt-4"
        />
      </div>
      <main className="py-11 flex flex-col gap-4">
        <ResultCard
          question={questions[currentQuestion]}
          onNext={handleNext}
          onAnswer={handleAnswer}
          selectedAnswerId={selectedAnswer}
        />
      </main>
    </div>
  );
}
