import {
  quizzes,
  quizzSubmissions,
  users,
  games,
  questionsv2,
} from "@/db/schema";
import { auth } from "@/auth";
import { db } from "@/db";
import { count, eq, avg } from "drizzle-orm";

const getUserMetrics = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return;
  }

  // get total # of user quizzes
  const numQuizzes = await db
    .select({ value: count() })
    .from(games)
    .where(eq(games.userId, userId));

  // get total # of questions
  const numQuestions = await db
    .select({ value: count() })
    .from(questionsv2)
    .innerJoin(games, eq(questionsv2.gameId, games.id))
    .innerJoin(users, eq(games.userId, users.id))
    .where(eq(users.id, userId));

  // get total # of submissions
  const numSubmissions = await db
    .select({ value: count() })
    .from(quizzSubmissions)
    .innerJoin(quizzes, eq(quizzSubmissions.quizzId, quizzes.id))
    .innerJoin(users, eq(quizzes.userId, users.id))
    .where(eq(users.id, userId));

  // get the average score
  const avgScore = await db
    .select({ value: avg(quizzSubmissions.score) })
    .from(quizzSubmissions)
    .innerJoin(quizzes, eq(quizzSubmissions.quizzId, quizzes.id))
    .innerJoin(users, eq(quizzes.userId, users.id))
    .where(eq(users.id, userId));

  return [
    { label: "Quizzes", value: numQuizzes[0].value },
    { label: "Questions", value: numQuestions[0].value },
    { label: "Submissions", value: numSubmissions[0].value },
    { label: "Average Score", value: avgScore[0].value },
  ];
};

export default getUserMetrics;
