import { auth } from "@/auth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";
import { db } from "@/db";
import { games, questionsv2, topicCounts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: Request, res: Response) {
  try {
    const session: any = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        {
          status: 401,
        }
      );
    }
    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);
    const [game] = await db
      .insert(games)
      .values({
        id: uuid(),
        gameType: type,
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
      })
      .returning();
    await db
      .insert(topicCounts)
      .values({
        id: uuid(),
        topic,
        count: 1,
      })
      .onConflictDoUpdate({
        target: topicCounts.topic,
        set: {
          count: sql`${topicCounts.count} + 1`,
        },
      });

    const { data } = await axios.post(
      `${process.env.API_URL as string}/api/questions`,
      {
        amount,
        topic,
        type,
      }
    );

    if (type === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      const manyData = data.questions.map((question: mcqQuestion) => {
        // mix up the options lol
        const options = [
          question.option1,
          question.option2,
          question.option3,
          question.answer,
        ].sort(() => Math.random() - 0.5);
        return {
          id: uuid(),
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          gameId: game.id,
          questionType: "mcq",
        };
      });

      await db.insert(questionsv2).values(manyData);
    } else if (type === "open_ended") {
      type openQuestion = {
        question: string;
        answer: string;
      };
      await db.insert(questionsv2).values(
        data.questions.map((question: openQuestion) => {
          return {
            question: question.question,
            answer: question.answer,
            gameId: game.id,
            questionType: "open_ended",
          };
        })
      );
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}
export async function GET(req: Request, res: Response) {
  try {
    const session: any = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        {
          status: 401,
        }
      );
    }
    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        {
          status: 400,
        }
      );
    }

    const game = await db.query.games.findFirst({
      where: (games, { eq }) => eq(games.id, gameId),
      with: {
        questionsv2: true,
      },
    });
    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { game },
      {
        status: 400,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      {
        status: 500,
      }
    );
  }
}
