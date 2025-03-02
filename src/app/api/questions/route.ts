import { strict_output } from "@/lib/gpt";
import { getQuestionsSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase/firebase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

// Initialize Firebase Admin if not already initialized
initAdmin();

// Define prompt constants
const OPEN_ENDED_SYSTEM_PROMPT = 
  "You are a helpful AI that is able to generate a pair of question and answers, " +
  "the length of each answer should not be more than 15 words, " +
  "store all the pairs of answers and questions in a JSON array";

const MCQ_SYSTEM_PROMPT = 
  "You are a helpful AI that is able to generate mcq questions and answers, " +
  "the length of each answer should not be more than 15 words, " +
  "store all answers and questions and options in a JSON array";

const OPEN_ENDED_FORMAT = {
  question: "question",
  answer: "answer with max length of 15 words",
};

const MCQ_FORMAT = {
  question: "question",
  answer: "answer with max length of 15 words",
  option1: "option1 different from answer with max length of 15 words",
  option2: "option2 different from answer with max length of 15 words",
  option3: "option3 different from answer with max length of 15 words",
};

export async function POST(req: Request, res: Response) {
  try {
    // Get Firebase auth token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get user
    let userId;
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to create questions." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, topic, type } = getQuestionsSchema.parse(body);
    
    let questions: any;
    
    try {
      if (type === "open_ended") {
        questions = await strict_output(
          OPEN_ENDED_SYSTEM_PROMPT,
          new Array(amount).fill(
            `You are to generate a random hard open-ended questions about ${topic}`
          ),
          OPEN_ENDED_FORMAT
        );
      } else if (type === "mcq") {
        questions = await strict_output(
          MCQ_SYSTEM_PROMPT,
          new Array(amount).fill(
            `You are to generate a random hard mcq question about ${topic}`
          ),
          MCQ_FORMAT
        );
      } else {
        return NextResponse.json(
          { error: "Invalid question type. Must be 'mcq' or 'open_ended'." },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      return NextResponse.json(
        { error: "Failed to generate questions. Please try again later." },
        { status: 500 }
      );
    }
    
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate questions." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { questions: questions },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    } else {
      console.error("Question generation error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}
