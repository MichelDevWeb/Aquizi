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

// Define types for Firestore documents
interface TopicCount {
  id: string;
  topic: string;
  count: number;
}

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
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);
    
    // Create a new game ID
    const gameId = uuid();
    
    // Create game in Firestore
    await createDocumentWithId(
      COLLECTIONS.GAMES,
      gameId,
      {
        id: gameId,
        gameType: type,
        timeStarted: new Date(),
        userId: userId,
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

    // Get questions from API
    const { data } = await axios.post(
      `${process.env.API_URL as string}/api/questions`,
      {
        amount,
        topic,
        type,
      }
    );

    // Process and store questions based on type
    if (type === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      // Process MCQ questions
      for (const question of data.questions) {
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
      type openQuestion = {
        question: string;
        answer: string;
      };
      
      // Process open-ended questions
      for (const question of data.questions) {
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

    return NextResponse.json({ gameId: gameId }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("Error creating game:", error);
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
        { error: "You must be logged in to create a game." },
        { status: 401 }
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

    // Get game from Firestore
    const game = await getDocumentById(COLLECTIONS.GAMES, gameId);
    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
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
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error retrieving game:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      {
        status: 500,
      }
    );
  }
}
