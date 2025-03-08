import { endGameSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { getDocumentById, updateDocument, getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS } from "@/lib/firestore/firestore-config";
import { addDoc, collection, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firestore/firestore-config";
import { differenceInSeconds } from "date-fns";

// Define types for Firestore documents
interface Game {
  id: string;
  gameType: string;
  timeStarted: Date;
  timeEnded?: Date;
  userId: string;
  topic: string;
  submissionId?: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  gameId: string;
  questionType: "mcq" | "open_ended";
  options?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface Submission {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  createdAt: Date;
  updatedAt?: Date;
  timeSpent?: number;
  startTime?: Date;
  endTime?: Date;
  retestCount?: number;
  bestTime?: number;
  averageTime?: number;
  lastRetestTime?: number;
}

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { gameId, timeStarted, submissionId } = endGameSchema.parse(body);

    // Get game from Firestore
    const game = await getDocumentById<Game>(COLLECTIONS.GAMES, gameId);
    
    if (!game) {
      return NextResponse.json(
        {
          message: "Game not found",
        },
        {
          status: 404,
        }
      );
    }
    
    const endTime = new Date();
    const startTime = new Date(timeStarted);
    
    // Update game in Firestore with end time
    await updateDocument(
      COLLECTIONS.GAMES,
      gameId,
      { 
        timeStarted: startTime, 
        timeEnded: endTime 
      }
    );
    
    // Calculate time spent in seconds
    const timeSpent = differenceInSeconds(
      endTime,
      startTime
    );
    
    // Get questions for this game to calculate score
    const questions = await getDocuments<Question>(
      COLLECTIONS.QUESTIONS,
      [where("gameId", "==", gameId)]
    );
    
    // Calculate score based on correct answers
    const correctAnswers = questions.filter(q => q.isCorrect === true);
    const score = correctAnswers.length;
    
    // If submissionId is provided, update existing submission (retest functionality)
    if (submissionId) {
      console.log('Updating existing submission:', submissionId);
      
      // Get the existing submission to verify it belongs to this game
      const existingSubmission = await getDocumentById<Submission>(
        COLLECTIONS.SUBMISSIONS,
        submissionId
      );
      
      if (!existingSubmission) {
        console.error('Submission not found:', submissionId);
        // If submission not found, create a new one instead of failing
      } else if (existingSubmission.gameId !== gameId) {
        console.error('Submission does not match game ID:', submissionId, gameId);
        // If submission doesn't match game, create a new one instead of failing
      } else {
        // Calculate retest statistics
        const retestCount = (existingSubmission.retestCount || 0) + 1;
        const previousBestTime = existingSubmission.bestTime || existingSubmission.timeSpent || 0;
        const bestTime = Math.min(previousBestTime, timeSpent);
        
        // Calculate average time (excluding the initial attempt)
        const previousAvgTime = existingSubmission.averageTime || 0;
        const previousRetestCount = existingSubmission.retestCount || 0;
        const averageTime = previousRetestCount > 0
          ? ((previousAvgTime * previousRetestCount) + timeSpent) / retestCount
          : timeSpent;
        
        // Update the existing submission
        await updateDocument(
          COLLECTIONS.SUBMISSIONS,
          submissionId,
          {
            score,
            timeSpent,
            updatedAt: serverTimestamp(),
            startTime: startTime,
            endTime: endTime,
            retestCount,
            bestTime,
            averageTime,
            lastRetestTime: timeSpent
          }
        );
        
        // Update game with latest score
        await updateDocument(
          COLLECTIONS.GAMES,
          gameId,
          { 
            score: score,
            totalQuestions: questions.length
          }
        );
        
        return NextResponse.json({
          message: "Game ended and submission updated",
          submissionId: submissionId,
          score: score,
          totalQuestions: questions.length,
          isRetest: true,
          timeSpent,
          bestTime,
          averageTime,
          retestCount
        });
      }
    }
    
    // Create new submission if no valid submissionId was provided
    const submissionData = {
      score,
      gameId,
      userId: game.userId,
      timeSpent,
      createdAt: serverTimestamp(),
      startTime: startTime,
      endTime: endTime,
      retestCount: 0,
      bestTime: timeSpent,
      averageTime: timeSpent
    };
    
    console.log('Creating submission document with data:', submissionData);
    
    const submissionRef = await addDoc(
      collection(db, COLLECTIONS.SUBMISSIONS), 
      submissionData
    );
    
    console.log('Submission created successfully with ID:', submissionRef.id);
    
    // Update game with submission ID for reference
    await updateDocument(
      COLLECTIONS.GAMES,
      gameId,
      { 
        submissionId: submissionRef.id,
        score: score,
        totalQuestions: questions.length
      }
    );
    
    return NextResponse.json({
      message: "Game ended and submission created",
      submissionId: submissionRef.id,
      score: score,
      totalQuestions: questions.length,
      isRetest: false,
      timeSpent,
      bestTime: timeSpent,
      averageTime: timeSpent,
      retestCount: 0
    });
  } catch (error) {
    console.error("Error ending game:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
