"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { ChevronLeft, X } from "lucide-react";
import ResultCard from "./ResultCard";
import QuizzSubmission from "./QuizzSubmission";
import { saveSubmission } from "@/app/actions/saveSubmissions";
import { useRouter } from "next/navigation";

// Define Firestore types
interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  quizzId: string;
  questionText: string;
  answers: Answer[];
}

interface Quizz {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  questions: Question[];
}

type Props = {
  quizz: Quizz;
};

export default function QuizzQuestions(props: Props) {
  const { questions } = props.quizz;
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; answerId: string }[]
  >([]);
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
      await saveSubmission({ 
        score, 
        gameId: props.quizz.id,
        userId: props.quizz.userId
      });
    } catch (e) {
      console.log(e);
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

  const scorePercentage: number = Math.round((score / questions.length) * 100);
  const selectedAnswer: string | undefined = userAnswers.find(
    (item) => item.questionId === questions[currentQuestion].id
  )?.answerId;
  const isCorrect: boolean | undefined =
    questions[currentQuestion].answers.findIndex(
      (answer) => answer.id === selectedAnswer
    ) !== -1
      ? questions[currentQuestion].answers.find(
          (answer) => answer.id === selectedAnswer
        )?.isCorrect
      : undefined;

  if (submitted) {
    return (
      <QuizzSubmission
        score={score}
        scorePercentage={scorePercentage}
        totalQuestions={questions.length}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="position-sticky top-0 z-10 shadow-md py-4 w-full">
        <header className="grid grid-cols-[auto,1fr,auto] grid-flow-col items-center justify-between py-2 gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePressPrev}
          >
            <ChevronLeft />
          </Button>
          <ProgressBar value={(currentQuestion / questions.length) * 100} />
          <Button
            size="icon"
            variant="outline"
            onClick={handleExit}
          >
            <X />
          </Button>
        </header>
      </div>
      <main className="flex justify-center flex-1">
        {!started ? (
          <h1 className="text-3xl font-bold">Welcome to the quizz page👋</h1>
        ) : (
          <div>
            <h2 className="text-3xl font-bold">
              {questions[currentQuestion].questionText}
            </h2>
            <div className="grid grid-cols-1 gap-6 mt-6">
              {questions[currentQuestion].answers.map((answer) => {
                const variant =
                  selectedAnswer === answer.id
                    ? answer.isCorrect
                      ? "neoSuccess"
                      : "neoDanger"
                    : "neoOutline";
                return (
                  <Button
                    key={answer.id}
                    disabled={!!selectedAnswer}
                    variant={variant}
                    size="xl"
                    onClick={() =>
                      handleAnswer(answer, questions[currentQuestion].id)
                    }
                    className="disabled:opacity-100"
                  >
                    <p className="whitespace-normal">{answer.answerText}</p>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <footer className="footer pb-9 px-6 relative mb-0">
        <ResultCard
          isCorrect={isCorrect}
          correctAnswer={
            questions[currentQuestion].answers.find(
              (answer) => answer.isCorrect === true
            )?.answerText || ""
          }
        />
        {currentQuestion === questions.length - 1 ? (
          <Button
            variant="neo"
            size="lg"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="neo"
            size="lg"
            onClick={handleNext}
          >
            {!started ? "Start" : "Next"}
          </Button>
        )}
      </footer>
    </div>
  );
}
