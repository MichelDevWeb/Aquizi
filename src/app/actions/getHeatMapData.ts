import { games } from "@/db/schema";
import { auth } from "@/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const getHeatMapData = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return;
  }

  const data = await db
    .select({
      createdAt: sql<string>`date_trunc('day', ${games.timeStarted})`,
      count: sql<number>`cast(count(${games.id}) as int)`,
    })
    .from(games)
    .where(
      sql`(${games.userId} = ${userId} AND ${games.timeStarted} is not null AND ${games.timeEnded} is not null)`
    )
    .groupBy(sql<string>`date_trunc('day', ${games.timeStarted})`);

  return { data };
};

export default getHeatMapData;
