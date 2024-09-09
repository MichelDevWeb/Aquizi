import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/auth";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";

import { redirect } from "next/navigation";
import React from "react";
import ResultsCard from "@/components/statistics/ResultsCard";
import AccuracyCard from "@/components/statistics/AccuracyCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import QuestionsList from "@/components/statistics/QuestionsList";
import { db } from "@/db";

type Props = {
  params: {
    gameId: string;
  };
};

const Statistics = async ({ params: { gameId } }: Props) => {
  const session: any = await auth();
  if (!session?.user) {
    return redirect("/");
  }
  const game = await db.query.games.findFirst({
    where: (games, { eq }) => eq(games.id, gameId),
    with: {
      questionsv2: {
        columns: {
          id: true,
          options: true,
          question: true,
          answer: true,
          userAnswer: true,
          percentageCorrect: true,
          isCorrect: true,
          gameId: true,
          questionType: true,
        },
      },
    },
  });

  if (!game) {
    return redirect("/");
  }

  let accuracy: number = 0;

  if (game.gameType === "mcq") {
    let totalCorrect = game.questionsv2.reduce((acc, question) => {
      if (question.isCorrect) {
        return acc + 1;
      }
      return acc;
    }, 0);
    accuracy = (totalCorrect / game.questionsv2.length) * 100;
  } else if (game.gameType === "open_ended") {
    let totalPercentage = game.questionsv2.reduce((acc, question) => {
      return acc + (question.percentageCorrect ?? 0);
    }, 0);
    accuracy = totalPercentage / game.questionsv2.length;
  }
  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard"
              className={buttonVariants()}
            >
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(game.timeEnded ?? 0)}
            timeStarted={new Date(game.timeStarted ?? 0)}
          />
        </div>
        <QuestionsList questions={game.questionsv2} />
      </div>
    </>
  );
};

export default Statistics;
