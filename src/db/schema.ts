import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  pgEnum,
  real,
  json,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  subscribed: boolean("subscribed"),
});

export const usersRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  userId: text("user_id").references(() => users.id),
});

export const quizzesRelations = relations(quizzes, ({ many, one }) => ({
  questions: many(questions),
  submissions: many(quizzSubmissions),
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text"),
  quizzId: integer("quizz_id"),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quizz: one(quizzes, {
    fields: [questions.quizzId],
    references: [quizzes.id],
  }),
  answers: many(questionAnswers),
}));

export const questionAnswers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id"),
  answerText: text("answer_text"),
  isCorrect: boolean("is_correct"),
});

export const questionAnswersRelations = relations(
  questionAnswers,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionAnswers.questionId],
      references: [questions.id],
    }),
  })
);

export const quizzSubmissions = pgTable("quizz_submissions", {
  id: serial("id").primaryKey(),
  quizzId: integer("quizz_id"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzSubmissionsRelations = relations(
  quizzSubmissions,
  ({ one, many }) => ({
    quizz: one(quizzes, {
      fields: [quizzSubmissions.quizzId],
      references: [quizzes.id],
    }),
  })
);

// Version 2
export const gameType = pgEnum("game_type", ["mcq", "open_ended"]);

export const games = pgTable("games", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  timeStarted: timestamp("time_started").notNull(),
  topic: text("topic").notNull(),
  timeEnded: timestamp("time_ended"),
  gameType: gameType("game_type").notNull(),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  questionsv2: many(questionsv2),
}));

export const topicCounts = pgTable("topic_counts", {
  id: text("id").primaryKey().notNull(),
  topic: text("topic").notNull().unique(),
  count: integer("count").notNull(),
});

export const questionsv2 = pgTable("questions_v2", {
  id: text("id").primaryKey().notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  gameId: text("game_id").notNull(),
  options: text("options"), // for mcq questions
  percentageCorrect: real("percentage_correct"), // for open_ended questions
  isCorrect: boolean("is_correct"), // for mcq questions
  questionType: gameType("question_type").notNull(),
  userAnswer: text("user_answer"),
});

export const questionsv2Relations = relations(questionsv2, ({ one }) => ({
  game: one(games, {
    fields: [questionsv2.gameId],
    references: [games.id],
  }),
}));

