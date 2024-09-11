import OpenEnded from "@/components/OpenEnded";
import { db } from "@/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    gameId: string;
  };
};

const OpenEndedPage = async ({ params: { gameId } }: Props) => {
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
          answer: true,
        },
      },
    },
  });

  if (!game || game.gameType === "mcq") {
    return redirect("/quiz");
  }
  return <OpenEnded game={game} />;
};

export default OpenEndedPage;
