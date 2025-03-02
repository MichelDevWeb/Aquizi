import { endGameSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { getDocumentById, updateDocument } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS } from "@/lib/firestore/firestore-config";

// Define types for Firestore documents
interface Game {
  id: string;
  gameType: string;
  timeStarted: Date;
  timeEnded?: Date;
  userId: string;
  topic: string;
}

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { gameId, timeStarted } = endGameSchema.parse(body);

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
    
    // Update game in Firestore with end time
    await updateDocument(
      COLLECTIONS.GAMES,
      gameId,
      { 
        timeStarted: new Date(timeStarted), 
        timeEnded: new Date() 
      }
    );
    
    return NextResponse.json({
      message: "Game ended",
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
