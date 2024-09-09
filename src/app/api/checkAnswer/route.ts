import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import stringSimilarity from "string-similarity";
import { db } from "@/db";
import { questionsv2 } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);
    const [question] = await db
      .select()
      .from(questionsv2)
      .where(eq(questionsv2.id, questionId));
    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }
    await db
      .update(questionsv2)
      .set({ userAnswer: userInput })
      .where(eq(questionsv2.id, questionId));
    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();
      await db
        .update(questionsv2)
        .set({ isCorrect })
        .where(eq(questionsv2.id, questionId));
      return NextResponse.json({
        isCorrect,
      });
    } else if (question.questionType === "open_ended") {
      let percentageSimilar = stringSimilarity.compareTwoStrings(
        question.answer.toLowerCase().trim(),
        userInput.toLowerCase().trim()
      );
      percentageSimilar = Math.round(percentageSimilar * 100);
      await db
        .update(questionsv2)
        .set({ percentageCorrect: percentageSimilar })
        .where(eq(questionsv2.id, questionId));
      return NextResponse.json({
        percentageSimilar,
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
}
