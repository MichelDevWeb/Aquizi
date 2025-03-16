import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebase-config";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { v4 as uuidv4 } from "uuid";

// Define types for the score data
interface VocabularyScore {
  id: string;
  userId: string;
  score: number;
  wordsCorrect: string[];
  wordsIncorrect: string[];
  createdAt: Date | null;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, score, wordsCorrect, wordsIncorrect } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Save score to Firestore
    const scoreCollection = collection(db, COLLECTIONS.VOCABULARY_SCORES);
    const docRef = await addDoc(scoreCollection, {
      [FIELDS.VOCABULARY_SCORE.ID]: uuidv4(),
      [FIELDS.VOCABULARY_SCORE.USER_ID]: userId,
      [FIELDS.VOCABULARY_SCORE.SCORE]: score,
      [FIELDS.VOCABULARY_SCORE.WORDS_CORRECT]: wordsCorrect || [],
      [FIELDS.VOCABULARY_SCORE.WORDS_INCORRECT]: wordsIncorrect || [],
      [FIELDS.VOCABULARY_SCORE.CREATED_AT]: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, score }, { status: 200 });
  } catch (e: any) {
    console.error("Error saving score:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const leaderboard = url.searchParams.get("leaderboard") === "true";
    
    if (!userId && !leaderboard) {
      return NextResponse.json(
        { error: "User ID or leaderboard parameter is required" },
        { status: 400 }
      );
    }

    const scoreCollection = collection(db, COLLECTIONS.VOCABULARY_SCORES);
    let scoreQuery;
    
    if (leaderboard) {
      // Get top 10 scores for leaderboard
      scoreQuery = query(
        scoreCollection,
        orderBy(FIELDS.VOCABULARY_SCORE.SCORE, "desc"),
        limit(10)
      );
    } else {
      // Get user's scores
      scoreQuery = query(
        scoreCollection,
        orderBy(FIELDS.VOCABULARY_SCORE.CREATED_AT, "desc"),
        limit(10)
      );
    }
    
    const querySnapshot = await getDocs(scoreQuery);
    const scores: VocabularyScore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        id: doc.id,
        userId: data[FIELDS.VOCABULARY_SCORE.USER_ID],
        score: data[FIELDS.VOCABULARY_SCORE.SCORE],
        wordsCorrect: data[FIELDS.VOCABULARY_SCORE.WORDS_CORRECT] || [],
        wordsIncorrect: data[FIELDS.VOCABULARY_SCORE.WORDS_INCORRECT] || [],
        createdAt: data[FIELDS.VOCABULARY_SCORE.CREATED_AT]?.toDate() || null,
      });
    });

    return NextResponse.json({ scores }, { status: 200 });
  } catch (e: any) {
    console.error("Error getting scores:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 