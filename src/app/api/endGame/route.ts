import { endGameSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { gameId } = endGameSchema.parse(body);

    const game = await db.query.games.findFirst({
      where: (games, { eq }) => eq(games.id, gameId),
    });
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
    await db
      .update(games)
      .set({ timeEnded: new Date() })
      .where(eq(games.id, gameId));
    return NextResponse.json({
      message: "Game ended",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
