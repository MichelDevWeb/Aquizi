import React from "react";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";

interface Props {
  question: {
    id: string;
    questionText: string;
    answers: {
      id: string;
      questionId: string;
      answerText: string;
      isCorrect: boolean;
    }[];
  };
  onNext: () => void;
  onAnswer: (answer: any, questionId: string) => void;
  selectedAnswerId?: string;
}

const ResultCard = ({ question, onNext, onAnswer, selectedAnswerId }: Props) => {
  const { isCorrect } = question.answers.find(a => a.id === selectedAnswerId) || {};

  if (isCorrect === null || isCorrect === undefined) {
    return null;
  }

  const text = isCorrect
    ? "Correct!"
    : "Incorrect! The correct answer is: " + question.answers.find(a => a.isCorrect)?.answerText;

  const borderClasses = clsx({
    "border-green-500": isCorrect,
    "border-red-500": !isCorrect,
  });

  return (
    <div
      className={cn(
        borderClasses,
        "border-2",
        "rounded-lg",
        "p-4",
        "text-center",
        "text-lg",
        "font-semibold",
        "my-4",
        "bg-secondary"
      )}
    >
      {text}
    </div>
  );
};

export default ResultCard;
