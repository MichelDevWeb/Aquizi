"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { ChevronLeft, X } from "lucide-react";
import ResultCard from "./ResultCard";
import QuizzSubmission from "./QuizzSubmission";
import PageLayout from "@/components/PageLayout";
import { useRouter } from "next/navigation";

const questions = [
  {
    questionText: "What is React?",
    answers: [
      {
        answerText: "A library for building user interfaces",
        isCorrect: true,
        id: 1,
      },
      { answerText: "A front-end framework", isCorrect: false, id: 2 },
      { answerText: "A back-end framework", isCorrect: false, id: 3 },
      { answerText: "A database", isCorrect: false, id: 4 },
    ],
  },
  {
    questionText: "What is JSX?",
    answers: [
      { answerText: "JavaScript XML", isCorrect: true, id: 1 },
      { answerText: "JavaScript", isCorrect: false, id: 2 },
      { answerText: "JavaScript and XML", isCorrect: false, id: 3 },
      { answerText: "JavaScript and HTML", isCorrect: false, id: 4 },
    ],
  },
  {
    questionText: "What is the virtual DOM?",
    answers: [
      {
        answerText: "A virtual representation of the DOM",
        isCorrect: true,
        id: 1,
      },
      { answerText: "A real DOM", isCorrect: false, id: 2 },
      {
        answerText: "A virtual representation of the browser",
        isCorrect: false,
        id: 3,
      },
      {
        answerText: "A virtual representation of the server",
        isCorrect: false,
        id: 4,
      },
    ],
  },
];

export default function Home() {
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const handleNext = () => {
    if (!started) {
      setStarted(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setSubmitted(true);
      return;
    }

    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (answer: any) => {
    setSelectedAnswer(answer.id);
    const isCurrentCorrect = answer.isCorrect;
    if (isCurrentCorrect) {
      setScore(score + 1);
    }
    setIsCorrect(isCurrentCorrect);
  };

  const scorePercentage: number = Math.round((score / questions.length) * 100);

  if (submitted) {
    return (
      <PageLayout contentWidth="narrow" mobilePadding="medium" safePaddingBottom={true}>
        <QuizzSubmission
          score={score}
          scorePercentage={scorePercentage}
          totalQuestions={questions.length}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout contentWidth="medium" mobilePadding="small" className="py-2 sm:py-4" safePaddingBottom={true}>
      <div className="position-sticky top-0 z-10 shadow-md py-2 sm:py-4 w-full bg-background">
        <header className="grid grid-cols-[auto,1fr,auto] grid-flow-col items-center justify-between py-2 gap-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="sm:mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <ProgressBar
              value={
                !started
                  ? 0
                  : ((currentQuestion + 1) / questions.length) * 100
              }
              className="hidden sm:block w-32 sm:w-40"
            />
          </div>
          <div className="sm:hidden w-full mx-2">
            <ProgressBar
              value={
                !started
                  ? 0
                  : ((currentQuestion + 1) / questions.length) * 100
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
          >
            <X className="h-5 w-5" />
          </Button>
        </header>
      </div>
      
      <main className="flex-1 flex justify-center items-center py-4 sm:py-8">
        {!started ? (
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Welcome to the Aquizi quiz</h1>
            <p className="mb-4 text-muted-foreground">Test your knowledge with this quiz about React.</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl px-2 sm:px-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              {questions[currentQuestion].questionText}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQuestion].answers.map((answer) => {
                const variant =
                  selectedAnswer !== null
                    ? selectedAnswer === answer.id
                      ? isCorrect
                        ? "neoSuccess"
                        : "neoDanger"
                      : "neoOutline"
                    : "neoOutline";
                return (
                  <Button
                    key={answer.id}
                    variant={variant}
                    size="xl"
                    onClick={() => handleAnswer(answer)}
                    className="text-left justify-start h-auto py-3 sm:py-4"
                  >
                    <p className="whitespace-normal">{answer.answerText}</p>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer pb-6 sm:pb-9 px-4 sm:px-6 mt-auto flex flex-col items-center">
        {isCorrect !== null && (
          <ResultCard
            question={{
              id: currentQuestion.toString(),
              questionText: questions[currentQuestion].questionText,
              answers: questions[currentQuestion].answers.map(answer => ({
                id: answer.id.toString(),
                questionId: currentQuestion.toString(),
                answerText: answer.answerText,
                isCorrect: answer.isCorrect
              }))
            }}
            onNext={handleNext}
            onAnswer={handleAnswer}
            selectedAnswerId={selectedAnswer ? selectedAnswer.toString() : undefined}
          />
        )}
        <Button
          variant="neo"
          size="lg"
          onClick={handleNext}
          className="w-full sm:w-auto mt-4"
        >
          {!started
            ? "Start"
            : currentQuestion === questions.length - 1
            ? "Submit"
            : "Next"}
        </Button>
      </footer>
    </PageLayout>
  );
}
