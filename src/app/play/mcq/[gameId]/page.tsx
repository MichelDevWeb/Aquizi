import MCQ from "@/components/MCQ";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import { db } from "@/db";

type Props = {
  params: {
    gameId: string;
  };
};

const MCQPage = async ({ params: { gameId } }: Props) => {
  const session: any = await auth();
  if (!session?.user) {
    return redirect("/");
  }

  const game: any = await db.query.games.findFirst({
    where: (games, { eq }) => eq(games.id, gameId),
    with: {
      questionsv2: {
        columns: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });
  if (!game || game.gameType === "open_ended") {
    return redirect("/quiz");
  }
  return <MCQ game={game} />;
};

export default MCQPage;
