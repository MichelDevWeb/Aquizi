import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import stringSimilarity from "string-similarity";
import { getDocumentById, updateDocument } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";

// Define types for Firestore documents
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

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);
    
    // Get question from Firestore
    const question = await getDocumentById<Question>(COLLECTIONS.QUESTIONS, questionId);
    
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
    
    // Update user answer in Firestore
    await updateDocument(
      COLLECTIONS.QUESTIONS,
      questionId,
      { userAnswer: userInput }
    );
    
    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();
      
      // Update isCorrect field in Firestore
      await updateDocument(
        COLLECTIONS.QUESTIONS,
        questionId,
        { isCorrect }
      );
      
      return NextResponse.json({
        isCorrect,
      });
    } else if (question.questionType === "open_ended") {
      let percentageSimilar = stringSimilarity.compareTwoStrings(
        question.answer.toLowerCase().trim(),
        userInput.toLowerCase().trim()
      );
      percentageSimilar = Math.round(percentageSimilar * 100);
      
      // Update percentageCorrect field in Firestore
      await updateDocument(
        COLLECTIONS.QUESTIONS,
        questionId,
        { percentageCorrect: percentageSimilar }
      );
      
      return NextResponse.json({
        percentageSimilar,
      });
    }
    
    return NextResponse.json(
      {
        message: "Invalid question type",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error checking answer:", error);
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
    
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
      },
      {
        status: 500,
      }
    );
  }
}
