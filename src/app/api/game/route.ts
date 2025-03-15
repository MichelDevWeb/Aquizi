import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { 
  createDocumentWithId, 
  getDocumentById, 
  updateDocument,
  getDocuments
} from "@/lib/firestore/firestore-utils";
import { where, query, increment } from "firebase/firestore";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase/firebase-admin";
import { strict_output } from "@/lib/gpt";

// Initialize Firebase Admin if not already initialized
initAdmin();

// Define runtime configuration
export const runtime = "nodejs";
export const maxDuration = 60;

// Define types for Firestore documents
interface TopicCount {
  id: string;
  topic: string;
  count: number;
}

// Define prompt constants for question generation
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

/**
 * Extract and validate the authorization token from the request headers
 * @param req The incoming request
 * @returns The token and optional userId if verification is successful
 */
async function getAuthToken(req: Request) {
  // Get authorization header
  const authHeader = req.headers.get("Authorization");
  
  // Check if authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }
  
  // Extract token
  const token = authHeader.split("Bearer ")[1];
  
  if (!token || token.trim() === '') {
    return { error: "Empty token provided", status: 401 };
  }
  
  // Return the token without verification - we'll use it directly
  return { token };
}

/**
 * Generate questions using OpenAI based on topic, type, and amount
 * @param topic The topic for questions
 * @param type The type of questions (mcq or open_ended)
 * @param amount The number of questions to generate
 * @returns Array of generated questions
 */
async function generateQuestions(topic: string, type: string, amount: number) {
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
      throw new Error("Invalid question type. Must be 'mcq' or 'open_ended'.");
    }
    
    if (!questions || questions.length === 0) {
      throw new Error("Failed to generate questions.");
    }
    
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

export async function POST(req: Request, res: Response) {
  try {
    // Log request headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Get auth token
    const authResult = await getAuthToken(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { token } = authResult;
    
    // Try to get userId from token, but don't fail if it doesn't work
    let userId = 'anonymous';
    try {
      const auth = getAuth();
      if (auth) {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      }
    } catch (error) {
      console.warn("Could not verify token, continuing as anonymous:", error);
      // Continue with the request even if token verification fails
    }
    
    // Parse request body
    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);
    
    // Create a new game ID
    const gameId = uuid();
    
    // Generate questions directly instead of calling the questions API
    let questionsData;
    try {
      questionsData = await generateQuestions(topic, type, amount);
      
      // Validate that we have questions
      if (!questionsData || questionsData.length === 0) {
        return NextResponse.json(
          { error: "Failed to generate questions for the quiz." },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      return NextResponse.json(
        { error: "Failed to generate questions for the quiz." },
        { status: 500 }
      );
    }
    
    try {
      // Only create the game if we have questions
      // Create game in Firestore
      await createDocumentWithId(
        COLLECTIONS.GAMES,
        gameId,
        {
          id: gameId,
          gameType: type,
          timeStarted: new Date(),
          userId,
          topic,
        }
      );
      
      // Update topic counts in Firestore
      try {
        // Check if topic already exists
        const topicDocs = await getDocuments<TopicCount>(
          COLLECTIONS.TOPIC_COUNTS,
          [where(FIELDS.TOPIC_COUNT.TOPIC, "==", topic)]
        );
        
        if (topicDocs.length > 0) {
          // Update existing topic count
          await updateDocument(
            COLLECTIONS.TOPIC_COUNTS,
            topicDocs[0].id,
            { count: increment(1) }
          );
        } else {
          // Create new topic count
          await createDocumentWithId(
            COLLECTIONS.TOPIC_COUNTS,
            uuid(),
            {
              topic,
              count: 1,
            }
          );
        }
      } catch (error) {
        console.error("Error updating topic counts:", error);
        // Continue execution even if topic count update fails
      }
  
      // Process and store questions based on type
      if (type === "mcq") {
        // Process MCQ questions
        for (const question of questionsData) {
          // Mix up the options
          const options = [
            question.option1,
            question.option2,
            question.option3,
            question.answer,
          ].sort(() => Math.random() - 0.5);
          
          // Create question document in Firestore
          await createDocumentWithId(
            COLLECTIONS.QUESTIONS,
            uuid(),
            {
              question: question.question,
              answer: question.answer,
              options: JSON.stringify(options),
              gameId: gameId,
              questionType: "mcq",
            }
          );
        }
      } else if (type === "open_ended") {
        // Process open-ended questions
        for (const question of questionsData) {
          // Create question document in Firestore
          await createDocumentWithId(
            COLLECTIONS.QUESTIONS,
            uuid(),
            {
              question: question.question,
              answer: question.answer,
              gameId: gameId,
              questionType: "open_ended",
            }
          );
        }
      }
    } catch (error) {
      console.error("Error storing game data:", error);
      return NextResponse.json(
        { error: "Failed to store game data." },
        { status: 500 }
      );
    }

    return NextResponse.json({ gameId: gameId }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    } else {
      console.error("Error creating game:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}

export async function GET(req: Request, res: Response) {
  try {
    // Get auth token
    const authResult = await getAuthToken(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { token } = authResult;
    
    // Try to get userId from token, but don't fail if it doesn't work
    let userId = 'anonymous';
    try {
      const auth = getAuth();
      if (auth) {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      }
    } catch (error) {
      console.warn("Could not verify token, continuing as anonymous:", error);
      // Continue with the request even if token verification fails
    }
    
    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        { status: 400 }
      );
    }

    // Get game from Firestore
    const game = await getDocumentById(COLLECTIONS.GAMES, gameId);
    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        { status: 404 }
      );
    }

    // Get questions for the game
    const questions = await getDocuments(
      COLLECTIONS.QUESTIONS,
      [where(FIELDS.QUESTION.GAME_ID, "==", gameId)]
    );

    // Combine game and questions
    const gameWithQuestions = {
      ...game,
      questionsv2: questions,
    };

    return NextResponse.json(
      { game: gameWithQuestions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving game:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
