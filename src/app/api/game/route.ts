import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";
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

// Initialize Firebase Admin if not already initialized
initAdmin();

// API URL from environment variables
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Define types for Firestore documents
interface TopicCount {
  id: string;
  topic: string;
  count: number;
}

// Helper function to verify Firebase token
async function verifyFirebaseToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }
  
  const token = authHeader.split("Bearer ")[1];
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return { userId: decodedToken.uid, token };
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return { error: "Unauthorized", status: 401 };
  }
}

export async function POST(req: Request, res: Response) {
  try {
    // Verify Firebase token
    const authResult = await verifyFirebaseToken(req.headers.get("Authorization"));
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { userId, token } = authResult;
    
    // Parse request body
    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);
    
    // Create a new game ID
    const gameId = uuid();
    
    // Get questions from API first before creating the game
    let questionsData;
    try {
      const response = await axios.post(
        `${API_URL}/api/questions`,
        {
          amount,
          topic,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      questionsData = response.data.questions;
      
      // Validate that we have questions
      if (!questionsData || questionsData.length === 0) {
        return NextResponse.json(
          { error: "Failed to generate questions for the quiz." },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
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
    // Verify Firebase token
    const authResult = await verifyFirebaseToken(req.headers.get("Authorization"));
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    const { userId } = authResult;
    
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
