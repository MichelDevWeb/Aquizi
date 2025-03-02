import { db } from "@/lib/firestore/firestore-config";
import { COLLECTIONS } from "@/lib/firestore/firestore-config";
import { collection, addDoc, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";

// Define Firestore types
interface Answer {
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  answers?: Answer[];
}

interface SaveQuizzData {
  name: string;
  description: string;
  userId?: string;
  questions: Question[];
}

export default async function saveQuizz(quizzData: SaveQuizzData) {
  const { name, description, userId, questions } = quizzData;

  // Create a new quizz document
  const quizzRef = await addDoc(collection(db, COLLECTIONS.QUIZZES), {
    name,
    description,
    userId: userId || null,
    createdAt: serverTimestamp(),
  });
  
  const quizzId = quizzRef.id;
  
  // Use a batch to save all questions and answers
  const batch = writeBatch(db);
  
  // Process each question
  for (const question of questions) {
    // Create a unique ID for the question
    const questionId = uuid();
    
    // Create question document
    const questionRef = doc(db, COLLECTIONS.QUIZ_QUESTIONS, questionId);
    batch.set(questionRef, {
      id: questionId,
      quizzId,
      questionText: question.questionText,
    });
    
    // Process answers if they exist
    if (question.answers && question.answers.length > 0) {
      for (const answer of question.answers) {
        // Create a unique ID for the answer
        const answerId = uuid();
        
        // Create answer document
        const answerRef = doc(db, COLLECTIONS.QUIZ_ANSWERS, answerId);
        batch.set(answerRef, {
          id: answerId,
          questionId,
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
        });
      }
    }
  }
  
  // Commit the batch
  await batch.commit();

  return { quizzId };
}
