import { z } from "zod";

export const getQuestionsSchema = z.object({
  amount: z.number().int().positive().min(1).max(10),
  topic: z.string(),
  type: z.enum(["mcq", "open_ended"]),
});

export const checkAnswerSchema = z.object({
  userInput: z.string(),
  questionId: z.string(),
});

export const endGameSchema = z.object({
  gameId: z.string(),
});
