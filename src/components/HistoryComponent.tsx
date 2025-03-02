import { Clock, CopyCheck, Edit2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { convertDateToString } from "@/lib/utils";
import { getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where, orderBy, limit as firestoreLimit } from "firebase/firestore";

// Define Firestore types
interface Game {
  id: string;
  gameType: string;
  timeStarted: Date;
  timeEnded?: Date;
  userId: string;
  topic: string;
}

type Props = {
  limit: number;
  userId: string;
};

const HistoryComponent = async ({ limit, userId }: Props) => {
  // Get games from Firestore
  const games = await getDocuments<Game>(
    COLLECTIONS.GAMES,
    [
      where(FIELDS.GAME.USER_ID, "==", userId),
      orderBy(FIELDS.GAME.TIME_STARTED, "desc"),
      firestoreLimit(limit)
    ]
  );

  return (
    <div className="space-y-8">
      {games.map((game: Game) => {
        return (
          <div
            className="flex items-center justify-between"
            key={game.id}
          >
            <div className="flex items-center">
              {game.gameType === "mcq" ? (
                <CopyCheck className="mr-3" />
              ) : (
                <Edit2 className="mr-3" />
              )}
              <div className="ml-4 space-y-1">
                <Link
                  className="text-base font-medium leading-none underline"
                  href={`/statistics/${game.id}`}
                >
                  {game.topic}
                </Link>
                <p className="flex items-center px-2 py-1 text-xs text-white rounded-lg w-fit bg-slate-800">
                  <Clock className="w-4 h-4 mr-1" />
                  {convertDateToString(game.timeEnded || game.timeStarted, true)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {game.gameType === "mcq" ? "Multiple Choice" : "Open-Ended"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryComponent;
